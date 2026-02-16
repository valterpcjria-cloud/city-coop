export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_conversations: {
        Row: {
          class_id: string | null
          context: Json | null
          created_at: string | null
          id: string
          messages: Json
          title: string | null
          updated_at: string | null
          user_id: string | null
          user_type: string | null
        }
        Insert: {
          class_id?: string | null
          context?: Json | null
          created_at?: string | null
          id?: string
          messages?: Json
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_type?: string | null
        }
        Update: {
          class_id?: string | null
          context?: Json | null
          created_at?: string | null
          id?: string
          messages?: Json
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_researches: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          query: string
          results: Json
          sources: Json
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          query: string
          results: Json
          sources: Json
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          query?: string
          results?: Json
          sources?: Json
          user_id?: string | null
        }
        Relationships: []
      }
      assemblies: {
        Row: {
          agenda: Json
          attendance: Json | null
          class_id: string | null
          created_at: string | null
          created_by: string | null
          date: string
          decisions: Json | null
          id: string
          minutes: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          agenda: Json
          attendance?: Json | null
          class_id?: string | null
          created_at?: string | null
          created_by?: string | null
          date: string
          decisions?: Json | null
          id?: string
          minutes?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          agenda?: Json
          attendance?: Json | null
          class_id?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string
          decisions?: Json | null
          id?: string
          minutes?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assemblies_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assemblies_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_responses: {
        Row: {
          ai_feedback: Json | null
          answers: Json
          assessment_id: string | null
          completed_at: string | null
          id: string
          score: number | null
          student_id: string | null
        }
        Insert: {
          ai_feedback?: Json | null
          answers: Json
          assessment_id?: string | null
          completed_at?: string | null
          id?: string
          score?: number | null
          student_id?: string | null
        }
        Update: {
          ai_feedback?: Json | null
          answers?: Json
          assessment_id?: string | null
          completed_at?: string | null
          id?: string
          score?: number | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_responses_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_responses_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_responses_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_candidatos_nucleo_escolar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_responses_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_candidatos_nucleo_intercoop"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_responses_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_matching_opportunities"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "assessment_responses_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_students_complete"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          available_from: string | null
          available_until: string | null
          class_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          questions: Json
          title: string
          type: string
        }
        Insert: {
          available_from?: string | null
          available_until?: string | null
          class_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          questions: Json
          title: string
          type: string
        }
        Update: {
          available_from?: string | null
          available_until?: string | null
          class_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          questions?: Json
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          resource: string
          resource_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          resource: string
          resource_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          resource?: string
          resource_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      candidates: {
        Row: {
          aprovado: boolean | null
          conselho: string
          created_at: string | null
          election_id: string | null
          id: string
          proposta: string
          resultado: string | null
          student_id: string | null
          total_votos: number | null
        }
        Insert: {
          aprovado?: boolean | null
          conselho: string
          created_at?: string | null
          election_id?: string | null
          id?: string
          proposta: string
          resultado?: string | null
          student_id?: string | null
          total_votos?: number | null
        }
        Update: {
          aprovado?: boolean | null
          conselho?: string
          created_at?: string | null
          election_id?: string | null
          id?: string
          proposta?: string
          resultado?: string | null
          student_id?: string | null
          total_votos?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "candidates_election_id_fkey"
            columns: ["election_id"]
            isOneToOne: false
            referencedRelation: "elections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidates_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidates_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_candidatos_nucleo_escolar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidates_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_candidatos_nucleo_intercoop"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidates_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_matching_opportunities"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "candidates_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_students_complete"
            referencedColumns: ["id"]
          },
        ]
      }
      class_students: {
        Row: {
          class_id: string | null
          id: string
          joined_at: string | null
          left_at: string | null
          student_id: string | null
        }
        Insert: {
          class_id?: string | null
          id?: string
          joined_at?: string | null
          left_at?: string | null
          student_id?: string | null
        }
        Update: {
          class_id?: string | null
          id?: string
          joined_at?: string | null
          left_at?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_candidatos_nucleo_escolar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_candidatos_nucleo_intercoop"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_matching_opportunities"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "class_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_students_complete"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          code: string
          created_at: string | null
          end_date: string
          grade_level: string
          id: string
          modality: string
          name: string
          school_id: string | null
          settings: Json | null
          start_date: string
          status: string | null
          teacher_id: string | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          end_date: string
          grade_level: string
          id?: string
          modality: string
          name: string
          school_id?: string | null
          settings?: Json | null
          start_date: string
          status?: string | null
          teacher_id?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          end_date?: string
          grade_level?: string
          id?: string
          modality?: string
          name?: string
          school_id?: string | null
          settings?: Json | null
          start_date?: string
          status?: string | null
          teacher_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "vw_candidatos_nucleo_escolar"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "classes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "vw_candidatos_nucleo_intercoop"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "classes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "vw_students_complete"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "classes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      coop_eventos: {
        Row: {
          aprovado_por: string | null
          avaliacao_coletiva: string | null
          created_at: string | null
          data_aprovacao: string | null
          data_planejada: string | null
          data_realizada: string | null
          descricao: string | null
          documentos: Json | null
          fotos: Json | null
          id: string
          local: string | null
          nucleo_escolar_id: string
          orcamento_previsto: number | null
          orcamento_realizado: number | null
          publico_estimado: number | null
          relatorio_final: string | null
          status: string | null
          tipo_evento: string | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          aprovado_por?: string | null
          avaliacao_coletiva?: string | null
          created_at?: string | null
          data_aprovacao?: string | null
          data_planejada?: string | null
          data_realizada?: string | null
          descricao?: string | null
          documentos?: Json | null
          fotos?: Json | null
          id?: string
          local?: string | null
          nucleo_escolar_id: string
          orcamento_previsto?: number | null
          orcamento_realizado?: number | null
          publico_estimado?: number | null
          relatorio_final?: string | null
          status?: string | null
          tipo_evento?: string | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          aprovado_por?: string | null
          avaliacao_coletiva?: string | null
          created_at?: string | null
          data_aprovacao?: string | null
          data_planejada?: string | null
          data_realizada?: string | null
          descricao?: string | null
          documentos?: Json | null
          fotos?: Json | null
          id?: string
          local?: string | null
          nucleo_escolar_id?: string
          orcamento_previsto?: number | null
          orcamento_realizado?: number | null
          publico_estimado?: number | null
          relatorio_final?: string | null
          status?: string | null
          tipo_evento?: string | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coop_eventos_aprovado_por_fkey"
            columns: ["aprovado_por"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coop_eventos_nucleo_escolar_id_fkey"
            columns: ["nucleo_escolar_id"]
            isOneToOne: false
            referencedRelation: "nucleo_gestor_escolar"
            referencedColumns: ["id"]
          },
        ]
      }
      cooperative_opportunities: {
        Row: {
          carga_horaria: string | null
          competencias_desejadas: string[] | null
          contato_email: string | null
          contato_telefone: string | null
          contrapartida: string | null
          cooperative_id: string
          created_at: string | null
          data_fim: string | null
          data_inicio: string | null
          descricao: string | null
          id: string
          remuneracao_max: number | null
          remuneracao_min: number | null
          requisitos: string | null
          status: string | null
          tipo: string
          titulo: string
          updated_at: string | null
          vagas_disponiveis: number | null
        }
        Insert: {
          carga_horaria?: string | null
          competencias_desejadas?: string[] | null
          contato_email?: string | null
          contato_telefone?: string | null
          contrapartida?: string | null
          cooperative_id: string
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          id?: string
          remuneracao_max?: number | null
          remuneracao_min?: number | null
          requisitos?: string | null
          status?: string | null
          tipo: string
          titulo: string
          updated_at?: string | null
          vagas_disponiveis?: number | null
        }
        Update: {
          carga_horaria?: string | null
          competencias_desejadas?: string[] | null
          contato_email?: string | null
          contato_telefone?: string | null
          contrapartida?: string | null
          cooperative_id?: string
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          id?: string
          remuneracao_max?: number | null
          remuneracao_min?: number | null
          requisitos?: string | null
          status?: string | null
          tipo?: string
          titulo?: string
          updated_at?: string | null
          vagas_disponiveis?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cooperative_opportunities_cooperative_id_fkey"
            columns: ["cooperative_id"]
            isOneToOne: false
            referencedRelation: "cooperatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cooperative_opportunities_cooperative_id_fkey"
            columns: ["cooperative_id"]
            isOneToOne: false
            referencedRelation: "vw_matching_opportunities"
            referencedColumns: ["coop_id"]
          },
        ]
      }
      cooperatives: {
        Row: {
          ano_fundacao: number | null
          ativo: boolean | null
          cep: string | null
          cidade: string
          cnpj: string | null
          created_at: string | null
          descricao: string | null
          endereco: string | null
          estado: string
          id: string
          latitude: number | null
          longitude: number | null
          nome_fantasia: string | null
          numero_cooperados: number | null
          ramo_cooperativista: string | null
          razao_social: string
          responsavel_cargo: string | null
          responsavel_email: string
          responsavel_nome: string
          responsavel_telefone: string | null
          site: string | null
          updated_at: string | null
        }
        Insert: {
          ano_fundacao?: number | null
          ativo?: boolean | null
          cep?: string | null
          cidade: string
          cnpj?: string | null
          created_at?: string | null
          descricao?: string | null
          endereco?: string | null
          estado: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          nome_fantasia?: string | null
          numero_cooperados?: number | null
          ramo_cooperativista?: string | null
          razao_social: string
          responsavel_cargo?: string | null
          responsavel_email: string
          responsavel_nome: string
          responsavel_telefone?: string | null
          site?: string | null
          updated_at?: string | null
        }
        Update: {
          ano_fundacao?: number | null
          ativo?: boolean | null
          cep?: string | null
          cidade?: string
          cnpj?: string | null
          created_at?: string | null
          descricao?: string | null
          endereco?: string | null
          estado?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          nome_fantasia?: string | null
          numero_cooperados?: number | null
          ramo_cooperativista?: string | null
          razao_social?: string
          responsavel_cargo?: string | null
          responsavel_email?: string
          responsavel_nome?: string
          responsavel_telefone?: string | null
          site?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cycle_tests: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          cycle_id: string
          id: string
          instrucoes: string | null
          nota_aprovacao: number | null
          num_questoes: number | null
          tempo_limite_minutos: number | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          cycle_id: string
          id?: string
          instrucoes?: string | null
          nota_aprovacao?: number | null
          num_questoes?: number | null
          tempo_limite_minutos?: number | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          cycle_id?: string
          id?: string
          instrucoes?: string | null
          nota_aprovacao?: number | null
          num_questoes?: number | null
          tempo_limite_minutos?: number | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cycle_tests_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "test_cycles"
            referencedColumns: ["id"]
          },
        ]
      }
      election_documents: {
        Row: {
          conteudo: string | null
          created_at: string | null
          election_id: string | null
          id: string
          tipo: string | null
          url_pdf: string | null
        }
        Insert: {
          conteudo?: string | null
          created_at?: string | null
          election_id?: string | null
          id?: string
          tipo?: string | null
          url_pdf?: string | null
        }
        Update: {
          conteudo?: string | null
          created_at?: string | null
          election_id?: string | null
          id?: string
          tipo?: string | null
          url_pdf?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "election_documents_election_id_fkey"
            columns: ["election_id"]
            isOneToOne: false
            referencedRelation: "elections"
            referencedColumns: ["id"]
          },
        ]
      }
      elections: {
        Row: {
          class_id: string | null
          created_at: string | null
          data_fim_campanha: string | null
          data_fim_inscricoes: string | null
          data_fim_votacao: string | null
          data_inicio_campanha: string | null
          data_inicio_inscricoes: string | null
          data_inicio_votacao: string | null
          id: string
          status: string | null
          updated_at: string | null
          vagas_administracao: number | null
          vagas_etica: number | null
          vagas_fiscal_efetivos: number | null
          vagas_fiscal_suplentes: number | null
        }
        Insert: {
          class_id?: string | null
          created_at?: string | null
          data_fim_campanha?: string | null
          data_fim_inscricoes?: string | null
          data_fim_votacao?: string | null
          data_inicio_campanha?: string | null
          data_inicio_inscricoes?: string | null
          data_inicio_votacao?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          vagas_administracao?: number | null
          vagas_etica?: number | null
          vagas_fiscal_efetivos?: number | null
          vagas_fiscal_suplentes?: number | null
        }
        Update: {
          class_id?: string | null
          created_at?: string | null
          data_fim_campanha?: string | null
          data_fim_inscricoes?: string | null
          data_fim_votacao?: string | null
          data_inicio_campanha?: string | null
          data_inicio_inscricoes?: string | null
          data_inicio_votacao?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          vagas_administracao?: number | null
          vagas_etica?: number | null
          vagas_fiscal_efetivos?: number | null
          vagas_fiscal_suplentes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "elections_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      event_plans: {
        Row: {
          ai_evaluation: Json | null
          budget: Json
          class_id: string | null
          created_at: string | null
          description: string | null
          event_date: string | null
          id: string
          nuclei_plans: Json | null
          reviewed_at: string | null
          reviewed_by: string | null
          risk_analysis: Json | null
          status: string | null
          submitted_at: string | null
          timeline: Json
          title: string
          updated_at: string | null
        }
        Insert: {
          ai_evaluation?: Json | null
          budget: Json
          class_id?: string | null
          created_at?: string | null
          description?: string | null
          event_date?: string | null
          id?: string
          nuclei_plans?: Json | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_analysis?: Json | null
          status?: string | null
          submitted_at?: string | null
          timeline: Json
          title: string
          updated_at?: string | null
        }
        Update: {
          ai_evaluation?: Json | null
          budget?: Json
          class_id?: string | null
          created_at?: string | null
          description?: string | null
          event_date?: string | null
          id?: string
          nuclei_plans?: Json | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_analysis?: Json | null
          status?: string | null
          submitted_at?: string | null
          timeline?: Json
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_plans_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_plans_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      gestors: {
        Row: {
          avatar_url: string | null
          bio: string | null
          cpf: string | null
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          is_superadmin: boolean | null
          name: string
          phone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          cpf?: string | null
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          is_superadmin?: boolean | null
          name: string
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          is_superadmin?: boolean | null
          name?: string
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      knowledge_base: {
        Row: {
          category: string
          content: string
          created_at: string | null
          embedding: string | null
          id: string
          metadata: Json | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      managers: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      maturity_indicators: {
        Row: {
          approved_for_event: boolean | null
          calculated_at: string | null
          class_id: string | null
          cooperativism_understanding: number | null
          democratic_functioning: number | null
          event_planning: number | null
          financial_management: number | null
          id: string
          nuclei_organization: number | null
          overall_score: number | null
          student_id: string | null
          updated_at: string | null
        }
        Insert: {
          approved_for_event?: boolean | null
          calculated_at?: string | null
          class_id?: string | null
          cooperativism_understanding?: number | null
          democratic_functioning?: number | null
          event_planning?: number | null
          financial_management?: number | null
          id?: string
          nuclei_organization?: number | null
          overall_score?: number | null
          student_id?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_for_event?: boolean | null
          calculated_at?: string | null
          class_id?: string | null
          cooperativism_understanding?: number | null
          democratic_functioning?: number | null
          event_planning?: number | null
          financial_management?: number | null
          id?: string
          nuclei_organization?: number | null
          overall_score?: number | null
          student_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maturity_indicators_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maturity_indicators_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maturity_indicators_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_candidatos_nucleo_escolar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maturity_indicators_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_candidatos_nucleo_intercoop"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maturity_indicators_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_matching_opportunities"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "maturity_indicators_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_students_complete"
            referencedColumns: ["id"]
          },
        ]
      }
      nuclei: {
        Row: {
          class_id: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          class_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          class_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "nuclei_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      nucleo_escolar_members: {
        Row: {
          created_at: string | null
          criterios_selecao: Json | null
          data_ingresso: string | null
          data_saida: string | null
          id: string
          nucleo_id: string
          papel: string | null
          status: string | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          criterios_selecao?: Json | null
          data_ingresso?: string | null
          data_saida?: string | null
          id?: string
          nucleo_id: string
          papel?: string | null
          status?: string | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          criterios_selecao?: Json | null
          data_ingresso?: string | null
          data_saida?: string | null
          id?: string
          nucleo_id?: string
          papel?: string | null
          status?: string | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nucleo_escolar_members_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "nucleo_gestor_escolar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nucleo_escolar_members_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nucleo_escolar_members_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_candidatos_nucleo_escolar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nucleo_escolar_members_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_candidatos_nucleo_intercoop"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nucleo_escolar_members_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_matching_opportunities"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "nucleo_escolar_members_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_students_complete"
            referencedColumns: ["id"]
          },
        ]
      }
      nucleo_gestor_escolar: {
        Row: {
          class_id: string | null
          created_at: string | null
          data_formacao: string | null
          descricao: string | null
          id: string
          nome: string
          school_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          class_id?: string | null
          created_at?: string | null
          data_formacao?: string | null
          descricao?: string | null
          id?: string
          nome: string
          school_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          class_id?: string | null
          created_at?: string | null
          data_formacao?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          school_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nucleo_gestor_escolar_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nucleo_gestor_escolar_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nucleo_gestor_escolar_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "vw_candidatos_nucleo_escolar"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "nucleo_gestor_escolar_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "vw_candidatos_nucleo_intercoop"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "nucleo_gestor_escolar_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "vw_students_complete"
            referencedColumns: ["school_id"]
          },
        ]
      }
      nucleo_intercoop_members: {
        Row: {
          carga_horaria_semanal: number | null
          cooperativas_vinculadas: string[] | null
          created_at: string | null
          data_ingresso: string | null
          data_saida: string | null
          escolas_responsavel: string[] | null
          gestor_responsavel_id: string | null
          id: string
          observacoes: string | null
          papel: string
          projetos_atuacao: string[] | null
          remunerado: boolean | null
          status: string | null
          student_id: string
          tipo_vinculo: string | null
          updated_at: string | null
          valor_bolsa: number | null
        }
        Insert: {
          carga_horaria_semanal?: number | null
          cooperativas_vinculadas?: string[] | null
          created_at?: string | null
          data_ingresso?: string | null
          data_saida?: string | null
          escolas_responsavel?: string[] | null
          gestor_responsavel_id?: string | null
          id?: string
          observacoes?: string | null
          papel: string
          projetos_atuacao?: string[] | null
          remunerado?: boolean | null
          status?: string | null
          student_id: string
          tipo_vinculo?: string | null
          updated_at?: string | null
          valor_bolsa?: number | null
        }
        Update: {
          carga_horaria_semanal?: number | null
          cooperativas_vinculadas?: string[] | null
          created_at?: string | null
          data_ingresso?: string | null
          data_saida?: string | null
          escolas_responsavel?: string[] | null
          gestor_responsavel_id?: string | null
          id?: string
          observacoes?: string | null
          papel?: string
          projetos_atuacao?: string[] | null
          remunerado?: boolean | null
          status?: string | null
          student_id?: string
          tipo_vinculo?: string | null
          updated_at?: string | null
          valor_bolsa?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "nucleo_intercoop_members_gestor_responsavel_id_fkey"
            columns: ["gestor_responsavel_id"]
            isOneToOne: false
            referencedRelation: "gestors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nucleo_intercoop_members_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nucleo_intercoop_members_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "vw_candidatos_nucleo_escolar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nucleo_intercoop_members_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "vw_candidatos_nucleo_intercoop"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nucleo_intercoop_members_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "vw_matching_opportunities"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "nucleo_intercoop_members_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "vw_students_complete"
            referencedColumns: ["id"]
          },
        ]
      }
      nucleus_members: {
        Row: {
          id: string
          joined_at: string | null
          left_at: string | null
          nucleus_id: string | null
          role: string | null
          student_id: string | null
        }
        Insert: {
          id?: string
          joined_at?: string | null
          left_at?: string | null
          nucleus_id?: string | null
          role?: string | null
          student_id?: string | null
        }
        Update: {
          id?: string
          joined_at?: string | null
          left_at?: string | null
          nucleus_id?: string | null
          role?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nucleus_members_nucleus_id_fkey"
            columns: ["nucleus_id"]
            isOneToOne: false
            referencedRelation: "nuclei"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nucleus_members_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nucleus_members_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_candidatos_nucleo_escolar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nucleus_members_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_candidatos_nucleo_intercoop"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nucleus_members_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_matching_opportunities"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "nucleus_members_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_students_complete"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          address: string | null
          address_complement: string | null
          address_number: string | null
          administrative_category: string | null
          cep: string | null
          city: string | null
          code: string
          country: string | null
          created_at: string | null
          dependency: string | null
          director_name: string | null
          education_stages: string[] | null
          email: string | null
          id: string
          inep_code: string | null
          location_type: string | null
          name: string
          neighborhood: string | null
          operation_status: string | null
          phone: string | null
          secondary_phone: string | null
          settings: Json | null
          state: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          address_complement?: string | null
          address_number?: string | null
          administrative_category?: string | null
          cep?: string | null
          city?: string | null
          code: string
          country?: string | null
          created_at?: string | null
          dependency?: string | null
          director_name?: string | null
          education_stages?: string[] | null
          email?: string | null
          id?: string
          inep_code?: string | null
          location_type?: string | null
          name: string
          neighborhood?: string | null
          operation_status?: string | null
          phone?: string | null
          secondary_phone?: string | null
          settings?: Json | null
          state?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          address_complement?: string | null
          address_number?: string | null
          administrative_category?: string | null
          cep?: string | null
          city?: string | null
          code?: string
          country?: string | null
          created_at?: string | null
          dependency?: string | null
          director_name?: string | null
          education_stages?: string[] | null
          email?: string | null
          id?: string
          inep_code?: string | null
          location_type?: string | null
          name?: string
          neighborhood?: string | null
          operation_status?: string | null
          phone?: string | null
          secondary_phone?: string | null
          settings?: Json | null
          state?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      score_config: {
        Row: {
          id: string
          nota_minima_nucleo_escolar: number | null
          nota_minima_nucleo_intercoop: number | null
          peso_colaboracao: number | null
          peso_conhecimento: number | null
          peso_engajamento: number | null
          peso_perfil: number | null
          raio_matching_km: number | null
          testes_minimos_nucleo: number | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          nota_minima_nucleo_escolar?: number | null
          nota_minima_nucleo_intercoop?: number | null
          peso_colaboracao?: number | null
          peso_conhecimento?: number | null
          peso_engajamento?: number | null
          peso_perfil?: number | null
          raio_matching_km?: number | null
          testes_minimos_nucleo?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          nota_minima_nucleo_escolar?: number | null
          nota_minima_nucleo_intercoop?: number | null
          peso_colaboracao?: number | null
          peso_conhecimento?: number | null
          peso_engajamento?: number | null
          peso_perfil?: number | null
          raio_matching_km?: number | null
          testes_minimos_nucleo?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "score_config_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "gestors"
            referencedColumns: ["id"]
          },
        ]
      }
      student_collaboration_scores: {
        Row: {
          avaliador_id: string | null
          comunicacao: number | null
          created_at: string | null
          cycle_id: string
          id: string
          lideranca: number | null
          observacoes: string | null
          resolucao_conflitos: number | null
          student_id: string
          trabalho_equipe: number | null
          updated_at: string | null
        }
        Insert: {
          avaliador_id?: string | null
          comunicacao?: number | null
          created_at?: string | null
          cycle_id: string
          id?: string
          lideranca?: number | null
          observacoes?: string | null
          resolucao_conflitos?: number | null
          student_id: string
          trabalho_equipe?: number | null
          updated_at?: string | null
        }
        Update: {
          avaliador_id?: string | null
          comunicacao?: number | null
          created_at?: string | null
          cycle_id?: string
          id?: string
          lideranca?: number | null
          observacoes?: string | null
          resolucao_conflitos?: number | null
          student_id?: string
          trabalho_equipe?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_collaboration_scores_avaliador_id_fkey"
            columns: ["avaliador_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_collaboration_scores_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "test_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_collaboration_scores_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_collaboration_scores_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_candidatos_nucleo_escolar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_collaboration_scores_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_candidatos_nucleo_intercoop"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_collaboration_scores_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_matching_opportunities"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "student_collaboration_scores_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_students_complete"
            referencedColumns: ["id"]
          },
        ]
      }
      student_cooperative_connections: {
        Row: {
          avaliacao_cooperativa: number | null
          avaliacao_estudante: number | null
          cooperative_id: string
          created_at: string | null
          data_fim_atuacao: string | null
          data_indicacao: string | null
          data_inicio_atuacao: string | null
          documentos: Json | null
          feedback_cooperativa: string | null
          feedback_estudante: string | null
          id: string
          indicado_por: string | null
          observacoes: string | null
          opportunity_id: string | null
          status: string | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          avaliacao_cooperativa?: number | null
          avaliacao_estudante?: number | null
          cooperative_id: string
          created_at?: string | null
          data_fim_atuacao?: string | null
          data_indicacao?: string | null
          data_inicio_atuacao?: string | null
          documentos?: Json | null
          feedback_cooperativa?: string | null
          feedback_estudante?: string | null
          id?: string
          indicado_por?: string | null
          observacoes?: string | null
          opportunity_id?: string | null
          status?: string | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          avaliacao_cooperativa?: number | null
          avaliacao_estudante?: number | null
          cooperative_id?: string
          created_at?: string | null
          data_fim_atuacao?: string | null
          data_indicacao?: string | null
          data_inicio_atuacao?: string | null
          documentos?: Json | null
          feedback_cooperativa?: string | null
          feedback_estudante?: string | null
          id?: string
          indicado_por?: string | null
          observacoes?: string | null
          opportunity_id?: string | null
          status?: string | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_cooperative_connections_cooperative_id_fkey"
            columns: ["cooperative_id"]
            isOneToOne: false
            referencedRelation: "cooperatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_cooperative_connections_cooperative_id_fkey"
            columns: ["cooperative_id"]
            isOneToOne: false
            referencedRelation: "vw_matching_opportunities"
            referencedColumns: ["coop_id"]
          },
          {
            foreignKeyName: "student_cooperative_connections_indicado_por_fkey"
            columns: ["indicado_por"]
            isOneToOne: false
            referencedRelation: "gestors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_cooperative_connections_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "cooperative_opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_cooperative_connections_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "vw_matching_opportunities"
            referencedColumns: ["opportunity_id"]
          },
          {
            foreignKeyName: "student_cooperative_connections_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_cooperative_connections_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_candidatos_nucleo_escolar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_cooperative_connections_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_candidatos_nucleo_intercoop"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_cooperative_connections_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_matching_opportunities"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "student_cooperative_connections_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_students_complete"
            referencedColumns: ["id"]
          },
        ]
      }
      student_cooperative_profile: {
        Row: {
          avaliador_id: string | null
          capacidade_articulacao: number | null
          compromisso_coletivo: number | null
          conhecimento_cooperativista: number | null
          created_at: string | null
          id: string
          observacoes: string | null
          protagonismo_etico: number | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          avaliador_id?: string | null
          capacidade_articulacao?: number | null
          compromisso_coletivo?: number | null
          conhecimento_cooperativista?: number | null
          created_at?: string | null
          id?: string
          observacoes?: string | null
          protagonismo_etico?: number | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          avaliador_id?: string | null
          capacidade_articulacao?: number | null
          compromisso_coletivo?: number | null
          conhecimento_cooperativista?: number | null
          created_at?: string | null
          id?: string
          observacoes?: string | null
          protagonismo_etico?: number | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_cooperative_profile_avaliador_id_fkey"
            columns: ["avaliador_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_cooperative_profile_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_cooperative_profile_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "vw_candidatos_nucleo_escolar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_cooperative_profile_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "vw_candidatos_nucleo_intercoop"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_cooperative_profile_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "vw_matching_opportunities"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "student_cooperative_profile_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "vw_students_complete"
            referencedColumns: ["id"]
          },
        ]
      }
      student_engagement: {
        Row: {
          avaliador_id: string | null
          class_id: string | null
          created_at: string | null
          cycle_id: string
          entregas_realizadas: number | null
          frequencia_atividades: number | null
          id: string
          observacoes: string | null
          participacao_coletiva: number | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          avaliador_id?: string | null
          class_id?: string | null
          created_at?: string | null
          cycle_id: string
          entregas_realizadas?: number | null
          frequencia_atividades?: number | null
          id?: string
          observacoes?: string | null
          participacao_coletiva?: number | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          avaliador_id?: string | null
          class_id?: string | null
          created_at?: string | null
          cycle_id?: string
          entregas_realizadas?: number | null
          frequencia_atividades?: number | null
          id?: string
          observacoes?: string | null
          participacao_coletiva?: number | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_engagement_avaliador_id_fkey"
            columns: ["avaliador_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_engagement_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_engagement_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "test_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_engagement_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_engagement_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_candidatos_nucleo_escolar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_engagement_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_candidatos_nucleo_intercoop"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_engagement_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_matching_opportunities"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "student_engagement_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_students_complete"
            referencedColumns: ["id"]
          },
        ]
      }
      student_scores: {
        Row: {
          colaboracao_score: number | null
          conhecimento_score: number | null
          engajamento_score: number | null
          id: string
          perfil_cooperativista_score: number | null
          score_total: number | null
          student_id: string
          ultima_atualizacao: string | null
        }
        Insert: {
          colaboracao_score?: number | null
          conhecimento_score?: number | null
          engajamento_score?: number | null
          id?: string
          perfil_cooperativista_score?: number | null
          score_total?: number | null
          student_id: string
          ultima_atualizacao?: string | null
        }
        Update: {
          colaboracao_score?: number | null
          conhecimento_score?: number | null
          engajamento_score?: number | null
          id?: string
          perfil_cooperativista_score?: number | null
          score_total?: number | null
          student_id?: string
          ultima_atualizacao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_scores_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_scores_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "vw_candidatos_nucleo_escolar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_scores_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "vw_candidatos_nucleo_intercoop"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_scores_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "vw_matching_opportunities"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "student_scores_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "vw_students_complete"
            referencedColumns: ["id"]
          },
        ]
      }
      student_test_results: {
        Row: {
          data_realizacao: string | null
          id: string
          nota: number | null
          respostas: Json
          student_id: string
          tempo_gasto_minutos: number | null
          test_id: string
        }
        Insert: {
          data_realizacao?: string | null
          id?: string
          nota?: number | null
          respostas?: Json
          student_id: string
          tempo_gasto_minutos?: number | null
          test_id: string
        }
        Update: {
          data_realizacao?: string | null
          id?: string
          nota?: number | null
          respostas?: Json
          student_id?: string
          tempo_gasto_minutos?: number | null
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_test_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_test_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_candidatos_nucleo_escolar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_test_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_candidatos_nucleo_intercoop"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_test_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_matching_opportunities"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "student_test_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_students_complete"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_test_results_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "cycle_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          avatar_url: string | null
          bio: string | null
          cpf: string | null
          created_at: string | null
          email: string | null
          grade_level: string
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          school_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          grade_level: string
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          school_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          grade_level?: string
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          school_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "vw_candidatos_nucleo_escolar"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "students_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "vw_candidatos_nucleo_intercoop"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "students_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "vw_students_complete"
            referencedColumns: ["school_id"]
          },
        ]
      }
      system_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      teachers: {
        Row: {
          avatar_url: string | null
          bio: string | null
          certifications: Json | null
          cpf: string | null
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          school_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          certifications?: Json | null
          cpf?: string | null
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          school_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          certifications?: Json | null
          cpf?: string | null
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          school_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teachers_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teachers_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "vw_candidatos_nucleo_escolar"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "teachers_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "vw_candidatos_nucleo_intercoop"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "teachers_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "vw_students_complete"
            referencedColumns: ["school_id"]
          },
        ]
      }
      test_cycles: {
        Row: {
          ativo: boolean | null
          conteudo_pedagogico: string | null
          created_at: string | null
          data_fim: string | null
          data_inicio: string | null
          descricao: string | null
          id: string
          numero_ciclo: number
          titulo: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          conteudo_pedagogico?: string | null
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          id?: string
          numero_ciclo: number
          titulo: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          conteudo_pedagogico?: string | null
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          id?: string
          numero_ciclo?: number
          titulo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      test_questions: {
        Row: {
          created_at: string | null
          id: string
          opcao_a: string
          opcao_b: string
          opcao_c: string
          opcao_d: string
          ordem: number
          questao_texto: string
          resposta_correta: string
          test_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          opcao_a: string
          opcao_b: string
          opcao_c: string
          opcao_d: string
          ordem: number
          questao_texto: string
          resposta_correta: string
          test_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          opcao_a?: string
          opcao_b?: string
          opcao_c?: string
          opcao_d?: string
          ordem?: number
          questao_texto?: string
          resposta_correta?: string
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_questions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "cycle_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      vote_controls: {
        Row: {
          election_id: string | null
          id: string
          student_id: string | null
          timestamp_voto: string | null
          votou_administracao: boolean | null
          votou_etica: boolean | null
          votou_fiscal: boolean | null
        }
        Insert: {
          election_id?: string | null
          id?: string
          student_id?: string | null
          timestamp_voto?: string | null
          votou_administracao?: boolean | null
          votou_etica?: boolean | null
          votou_fiscal?: boolean | null
        }
        Update: {
          election_id?: string | null
          id?: string
          student_id?: string | null
          timestamp_voto?: string | null
          votou_administracao?: boolean | null
          votou_etica?: boolean | null
          votou_fiscal?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "vote_controls_election_id_fkey"
            columns: ["election_id"]
            isOneToOne: false
            referencedRelation: "elections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vote_controls_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vote_controls_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_candidatos_nucleo_escolar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vote_controls_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_candidatos_nucleo_intercoop"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vote_controls_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_matching_opportunities"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "vote_controls_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "vw_students_complete"
            referencedColumns: ["id"]
          },
        ]
      }
      votes: {
        Row: {
          candidate_id: string | null
          created_at: string | null
          id: string
        }
        Insert: {
          candidate_id?: string | null
          created_at?: string | null
          id?: string
        }
        Update: {
          candidate_id?: string | null
          created_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      vw_candidatos_nucleo_escolar: {
        Row: {
          colaboracao_score: number | null
          conhecimento_score: number | null
          cpf: string | null
          email: string | null
          engajamento_score: number | null
          grade_level: string | null
          id: string | null
          is_active: boolean | null
          name: string | null
          perfil_cooperativista_score: number | null
          phone: string | null
          school_city: string | null
          school_id: string | null
          school_name: string | null
          school_state: string | null
          score_total: number | null
          score_updated_at: string | null
          status_candidatura: string | null
          user_id: string | null
        }
        Relationships: []
      }
      vw_candidatos_nucleo_intercoop: {
        Row: {
          colaboracao_score: number | null
          conhecimento_score: number | null
          cpf: string | null
          email: string | null
          engajamento_score: number | null
          grade_level: string | null
          id: string | null
          is_active: boolean | null
          name: string | null
          perfil_cooperativista_score: number | null
          phone: string | null
          school_city: string | null
          school_id: string | null
          school_name: string | null
          school_state: string | null
          score_total: number | null
          score_updated_at: string | null
          status_candidatura: string | null
          user_id: string | null
        }
        Relationships: []
      }
      vw_matching_opportunities: {
        Row: {
          coop_id: string | null
          coop_name: string | null
          distancia_km: number | null
          grade_level: string | null
          opportunity_id: string | null
          opportunity_title: string | null
          score_total: number | null
          student_id: string | null
          student_name: string | null
          tipo_oportunidade: string | null
        }
        Relationships: []
      }
      vw_students_complete: {
        Row: {
          colaboracao_score: number | null
          conhecimento_score: number | null
          cpf: string | null
          email: string | null
          engajamento_score: number | null
          grade_level: string | null
          id: string | null
          is_active: boolean | null
          name: string | null
          perfil_cooperativista_score: number | null
          phone: string | null
          school_city: string | null
          school_id: string | null
          school_name: string | null
          school_state: string | null
          score_total: number | null
          score_updated_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      is_gestor: { Args: never; Returns: boolean }
      is_gestor_stable: { Args: never; Returns: boolean }
      is_teacher: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
