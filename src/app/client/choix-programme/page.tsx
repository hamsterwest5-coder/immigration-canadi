'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Home,
  Briefcase,
  GraduationCap,
  Plane,
  Users,
  Building2,
  HelpCircle,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import Button from '@/components/ui/Button'
import { ImmigrationProgram } from '@/types/database'

const programs: {
  code: ImmigrationProgram
  icon: React.ElementType
  title: string
  description: string
  criteria: string
}[] = [
  {
    code: 'permanente',
    icon: Home,
    title: 'Immigration permanente',
    description:
      'Accompagnement pour les programmes d’immigration économique permanente (Entrée Express, programmes provinciaux, etc.).',
    criteria: 'Profil CRS, expérience professionnelle, langues, études, âge, etc.',
  },
  {
    code: 'travail',
    icon: Briefcase,
    title: 'Permis de travail',
    description:
      'Accompagnement pour les demandes de permis de travail temporaire (LMIA, mobilité internationale, etc.).',
    criteria: 'Offre d’emploi, catégorie d’exemption, qualifications, employeur.',
  },
  {
    code: 'etudes',
    icon: GraduationCap,
    title: 'Études au Canada',
    description:
      'Accompagnement pour les permis d’études et la préparation du dossier étudiant.',
    criteria: 'Lettre d’acceptation, preuves financières, intention de retour.',
  },
  {
    code: 'visite',
    icon: Plane,
    title: 'Visite touristique / Super visa',
    description:
      'Accompagnement pour les visas de visiteur et super visas parents/grands-parents.',
    criteria: 'Preuves de liens, moyens financiers, assurance médicale le cas échéant.',
  },
  {
    code: 'regroupement_familial',
    icon: Users,
    title: 'Regroupement familial',
    description:
      'Accompagnement pour le parrainage d’époux, enfants, parents ou grands-parents.',
    criteria: 'Statut du parrain, preuves de relation, engagements financiers.',
  },
  {
    code: 'affaires_investissement',
    icon: Building2,
    title: 'Projet d’affaires ou d’investissement',
    description:
      'Accompagnement pour les programmes entrepreneurs, investisseurs et start-up.',
    criteria: 'Plan d’affaires, fonds disponibles, expérience entrepreneuriale.',
  },
  {
    code: 'autre',
    icon: HelpCircle,
    title: 'Autres projets d’immigration',
    description:
      'Pour les situations particulières non couvertes par les catégories précédentes.',
    criteria: 'Analyse personnalisée selon le profil et les objectifs.',
  },
]

export default function ChoixProgrammePage() {
  const router = useRouter()
  const [selected, setSelected] = useState<ImmigrationProgram | null>(null)

  const handleContinue = () => {
    if (!selected) return
    // Stocker le choix et rediriger vers le formulaire
    sessionStorage.setItem('selected_program', selected)
    router.push(`/client/candidature?program=${selected}`)
  }

  return (
    <div className="min-h-[80vh] bg-slate-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0a2540]">
            Choisissez votre projet d’immigration
          </h1>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
            Sélectionnez la catégorie qui correspond le mieux à vos objectifs.
            Chaque programme possède ses propres conditions. L’admissibilité
            dépend de votre profil et des règles applicables.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {programs.map((p) => {
            const Icon = p.icon
            const isSelected = selected === p.code
            return (
              <button
                key={p.code}
                type="button"
                onClick={() => setSelected(p.code)}
                className={`text-left p-5 rounded-2xl border-2 transition-all ${
                  isSelected
                    ? 'border-[#c8102e] bg-red-50/50 shadow-md'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-[#c8102e] text-white'
                        : 'bg-[#c8102e]/10 text-[#c8102e]'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-[#0a2540]">{p.title}</h3>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-[#c8102e] shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                      {p.description}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      <span className="font-medium">Principaux critères :</span> {p.criteria}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900 mb-8">
          <strong>Important :</strong> Ces catégories ne constituent pas des visas
          garantis. Chaque programme a ses propres conditions d’admissibilité. Notre
          rôle est de vous accompagner dans la préparation de votre dossier.
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/client"
            className="text-sm text-slate-600 hover:text-[#0a2540] transition-colors"
          >
            ← Retour à mon espace
          </Link>
          <Button
            size="lg"
            disabled={!selected}
            onClick={handleContinue}
            className="w-full sm:w-auto"
          >
            Continuer vers mon dossier
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
