import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Simple manual .env parser since dotenv might not be installed
function loadEnv() {
    const envPath = path.resolve(process.cwd(), '.env')
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8')
        content.split('\n').forEach(line => {
            const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
            if (match) {
                const key = match[1]
                let value = match[2] || ''
                if (value.length > 0 && value.startsWith('"') && value.endsWith('"')) {
                    value = value.substring(1, value.length - 1)
                }
                process.env[key] = value
            }
        })
    }
}

loadEnv()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables in .env file.')
    console.log('Available keys:', Object.keys(process.env).filter(k => k.includes('SUPABASE')))
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function setupSuperAdmin() {
    const email = 'valterpcjr@gmail.com'
    const password = 'NW=v1lt2r._00@'
    const name = 'Valter Junior'

    console.log(`Setting up SuperAdmin: ${email}...`)

    try {
        // 1. Check if user already exists
        const { data: users, error: listError } = await supabase.auth.admin.listUsers()
        if (listError) {
            console.error('Error listing users:', listError)
            return
        }

        let user = users.users.find(u => u.email === email)

        if (!user) {
            // 2. Create user if not exists
            console.log('User not found. Creating...')
            const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: {
                    name,
                    role: 'manager'
                }
            })

            if (createError) {
                console.error('Error creating user:', createError)
                return
            }
            user = newUser.user
            console.log('User created successfully.')
        } else {
            console.log('User already exists. Updating metadata...')
            // Update metadata just in case
            const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
                user_metadata: {
                    name,
                    role: 'manager'
                }
            })
            if (updateError) {
                console.error('Error updating user metadata:', updateError)
            }
        }

        // 3. Ensure record exists in public.managers
        console.log('Ensuring record in public.managers...')
        const { data: existingManager, error: fetchError } = await supabase
            .from('managers')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle()

        if (!existingManager) {
            const { error: managerError } = await supabase
                .from('managers')
                .insert({
                    user_id: user.id,
                    name,
                    email
                })

            if (managerError) {
                console.error('Error creating manager record:', managerError)
                console.log('Make sure the "managers" table exists. Run the migration script first.')
            } else {
                console.log('Manager record created successfully.')
            }
        } else {
            console.log('Manager record already exists.')
        }

        console.log('SuperAdmin setup complete!')
    } catch (err) {
        console.error('Unexpected error:', err)
    }
}

setupSuperAdmin()
