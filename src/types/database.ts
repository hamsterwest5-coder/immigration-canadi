export type UserRole = 'client' | 'admin'

export type ApplicationStatus =
  | 'brouillon'
  | 'soumise'
  | 'en_examen'
  | 'infos_complementaires'
  | 'attente_reponse_client'
  | 'approuvee_interne'
  | 'refusee_interne'
  | 'cloturee'

export type ImmigrationProgram =
  | 'permanente'
  | 'travail'
  | 'etudes'
  | 'visite'
  | 'regroupement_familial'
  | 'affaires_investissement'
  | 'autre'

export type MessageStatus = 'en_attente' | 'reponse_envoyee' | 'cloturee'
export type FamilyRole = 'principal' | 'conjoint' | 'enfant' | 'autre'

export interface Profile {
  id: string
  role: UserRole
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  date_of_birth: string | null
  place_of_birth: string | null
  nationality: string | null
  country_of_residence: string | null
  address: string | null
  created_at: string
  updated_at: string
}

export interface Program {
  id: string
  code: ImmigrationProgram
  title_fr: string
  description_fr: string
  criteria_fr: string | null
  is_active: boolean
  sort_order: number
}

export interface Application {
  id: string
  application_number: string
  user_id: string
  program: ImmigrationProgram
  status: ApplicationStatus
  is_family: boolean
  number_of_persons: number
  education_level: string | null
  field_of_study: string | null
  professional_experience: string | null
  current_profession: string | null
  languages: string[] | null
  french_level: string | null
  english_level: string | null
  budget_indicative: string | null
  desired_departure_date: string | null
  preferred_city_province: string | null
  project_description: string | null
  submitted_at: string | null
  created_at: string
  updated_at: string
}

export interface FamilyMember {
  id: string
  application_id: string
  first_name: string
  last_name: string
  age: number | null
  relationship: FamilyRole
  role_in_project: string | null
  created_at: string
}

export interface Document {
  id: string
  application_id: string
  user_id: string
  file_name: string
  file_path: string
  file_type: string | null
  file_size: number | null
  is_required: boolean
  uploaded_at: string
}

export interface StatusHistory {
  id: string
  application_id: string
  old_status: ApplicationStatus | null
  new_status: ApplicationStatus
  changed_by: string | null
  reason: string | null
  created_at: string
}

export interface AdminNote {
  id: string
  application_id: string
  admin_id: string
  note: string
  is_internal: boolean
  created_at: string
}

export interface Conversation {
  id: string
  application_id: string | null
  client_id: string
  subject: string
  status: MessageStatus
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  is_from_admin: boolean
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  body: string
  link: string | null
  is_read: boolean
  created_at: string
}

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  brouillon: 'Brouillon',
  soumise: 'Demande soumise',
  en_examen: 'En cours d\'examen',
  infos_complementaires: 'Informations complémentaires requises',
  attente_reponse_client: 'En attente de réponse du client',
  approuvee_interne: 'Approuvée pour la prochaine étape',
  refusee_interne: 'Refusée pour la prochaine étape',
  cloturee: 'Dossier clôturé',
}

export const PROGRAM_LABELS: Record<ImmigrationProgram, string> = {
  permanente: 'Immigration permanente',
  travail: 'Permis de travail',
  etudes: 'Études au Canada',
  visite: 'Visite touristique',
  regroupement_familial: 'Regroupement familial',
  affaires_investissement: 'Projet d\'affaires / investissement',
  autre: 'Autres projets',
}

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  brouillon: 'bg-gray-100 text-gray-700',
  soumise: 'bg-blue-100 text-blue-800',
  en_examen: 'bg-indigo-100 text-indigo-800',
  infos_complementaires: 'bg-amber-100 text-amber-800',
  attente_reponse_client: 'bg-orange-100 text-orange-800',
  approuvee_interne: 'bg-emerald-100 text-emerald-800',
  refusee_interne: 'bg-red-100 text-red-800',
  cloturee: 'bg-slate-100 text-slate-600',
}
