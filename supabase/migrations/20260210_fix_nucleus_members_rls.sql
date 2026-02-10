-- ============================================
-- FIX: MISSING RLS POLICIES FOR NUCLEI MANAGEMENT
-- ============================================

-- 1. nucleus_members Policies
-- Allow teachers to manage members (ALL)
CREATE POLICY "teachers_manage_nucleus_members" ON public.nucleus_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.nuclei n
      JOIN public.classes c ON c.id = n.class_id
      JOIN public.teachers t ON t.id = c.teacher_id
      WHERE n.id = nucleus_members.nucleus_id
      AND t.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.nuclei n
      JOIN public.classes c ON c.id = n.class_id
      JOIN public.teachers t ON t.id = c.teacher_id
      WHERE n.id = nucleus_members.nucleus_id
      AND t.user_id = auth.uid()
    )
  );

-- Allow students to view members of nuclei in their classes
CREATE POLICY "students_view_nucleus_members" ON public.nucleus_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.nuclei n
      JOIN public.class_students cs ON cs.class_id = n.class_id
      JOIN public.students s ON s.id = cs.student_id
      WHERE n.id = nucleus_members.nucleus_id
      AND s.user_id = auth.uid()
    )
  );

-- Allow gestors to view all
CREATE POLICY "gestors_view_nucleus_members" ON public.nucleus_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.gestors WHERE user_id = auth.uid())
  );

-- 2. class_students Policies
CREATE POLICY "teachers_manage_class_enrollments" ON public.class_students
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.classes c
      JOIN public.teachers t ON t.id = c.teacher_id
      WHERE c.id = class_students.class_id
      AND t.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.classes c
      JOIN public.teachers t ON t.id = c.teacher_id
      WHERE c.id = class_students.class_id
      AND t.user_id = auth.uid()
    )
  );

CREATE POLICY "students_view_class_enrollments" ON public.class_students
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.class_students cs
      JOIN public.students s ON s.id = cs.student_id
      WHERE cs.class_id = class_students.class_id
      AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "gestors_view_class_enrollments" ON public.class_students
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.gestors WHERE user_id = auth.uid())
  );
