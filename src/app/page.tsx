import Link from 'next/link'
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Users,
  GraduationCap,
  Briefcase,
  Plane,
  Home,
  Building2,
  HelpCircle,
  Shield,
  Clock,
  MessageSquare,
} from 'lucide-react'

const programs = [
  {
    icon: Home,
    title: 'Immigration permanente',
    description:
      'Accompagnement pour Entrée Express, programmes provinciaux et autres voies d’installation durable.',
    href: '/programmes#permanente',
  },
  {
    icon: Briefcase,
    title: 'Permis de travail',
    description:
      'Guidance pour les demandes de permis de travail temporaire et les catégories de mobilité internationale.',
    href: '/programmes#travail',
  },
  {
    icon: GraduationCap,
    title: 'Études au Canada',
    description:
      'Préparation du dossier de permis d’études et conseils pour votre projet étudiant.',
    href: '/programmes#etudes',
  },
  {
    icon: Plane,
    title: 'Visite touristique',
    description:
      'Accompagnement pour les visas de visiteur et les super visas parents/grands-parents.',
    href: '/programmes#visite',
  },
  {
    icon: Users,
    title: 'Regroupement familial',
    description:
      'Soutien pour le parrainage d’époux, d’enfants, de parents ou de grands-parents.',
    href: '/programmes#familial',
  },
  {
    icon: Building2,
    title: 'Affaires & investissement',
    description:
      'Accompagnement pour les programmes entrepreneurs, investisseurs et start-up.',
    href: '/programmes#affaires',
  },
]

const steps = [
  {
    number: '01',
    title: 'Inscription & choix du programme',
    description:
      'Créez votre compte et sélectionnez le type de projet qui correspond à vos objectifs.',
  },
  {
    number: '02',
    title: 'Dossier détaillé',
    description:
      'Remplissez le formulaire intelligent en plusieurs étapes. Sauvegardez votre brouillon à tout moment.',
  },
  {
    number: '03',
    title: 'Examen par notre équipe',
    description:
      'Votre dossier est analysé. Nous pouvons vous demander des informations complémentaires si nécessaire.',
  },
  {
    number: '04',
    title: 'Accompagnement personnalisé',
    description:
      'Suivez l’évolution de votre dossier depuis votre espace client et échangez avec nous via la messagerie.',
  },
]

const faqs = [
  {
    q: 'Ce site est-il un site officiel du gouvernement canadien ?',
    a: 'Non. Il s’agit d’une plateforme privée d’accompagnement. Nous ne sommes pas un organisme gouvernemental et nous n’avons aucun partenariat officiel avec Immigration, Réfugiés et Citoyenneté Canada (IRCC).',
  },
  {
    q: 'Garantissez-vous l’obtention d’un visa ou d’un permis ?',
    a: 'Non. Aucune garantie de résultat n’est possible. Les décisions appartiennent exclusivement aux autorités canadiennes compétentes. Notre rôle est de vous accompagner dans la préparation et le suivi de votre dossier.',
  },
  {
    q: 'Combien de personnes puis-je inclure dans mon dossier ?',
    a: 'Vous pouvez soumettre une demande individuelle (1 personne) ou familiale (de 2 à 13 personnes). Les informations de chaque membre sont collectées de manière sécurisée.',
  },
  {
    q: 'Comment suivre l’évolution de mon dossier ?',
    a: 'Après connexion à votre espace client, vous visualisez le statut actuel, l’historique des changements et les éventuelles demandes de documents. Vous recevez également des notifications.',
  },
  {
    q: 'Mes données sont-elles protégées ?',
    a: 'Oui. Nous appliquons des mesures de sécurité strictes : hachage des mots de passe, contrôle d’accès par utilisateur, stockage sécurisé des documents et journalisation des actions sensibles.',
  },
]

export default function HomePage() {
  return (
    <div className="bg-slate-50">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0a2540] via-[#0f2d4a] to-[#1e3a5f] text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm mb-6">
              <Shield className="w-4 h-4 text-emerald-300" />
              <span>Plateforme privée d’accompagnement professionnel</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
              Votre projet d’immigration au{' '}
              <span className="text-[#c8102e]">Canada</span>,
              <br />
              accompagné avec sérieux
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-300 leading-relaxed max-w-2xl">
              Nous vous guidons pas à pas dans la préparation de votre dossier
              d’immigration permanente, de permis de travail, d’études ou de
              regroupement familial. Transparence, professionnalisme et suivi
              personnalisé.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-[#c8102e] hover:bg-[#9b0c24] rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Commencer ma demande
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/client/suivi"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white border-2 border-white/30 hover:bg-white/10 rounded-xl transition-all"
              >
                <FileText className="w-5 h-5" />
                Suivre mon dossier
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Avertissement */}
      <div className="bg-amber-50 border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <p className="text-sm text-amber-900 text-center">
            <strong>Important :</strong> Ce site est une plateforme privée
            d’accompagnement. Il n’est pas un site officiel du gouvernement du
            Canada. Les décisions d’immigration relèvent exclusivement des
            autorités compétentes.
          </p>
        </div>
      </div>

      {/* Programmes */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0a2540]">
              Nos programmes d’accompagnement
            </h2>
            <p className="mt-4 text-slate-600">
              Chaque catégorie possède ses propres conditions. L’admissibilité
              dépend de votre profil et des règles en vigueur.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((p) => (
              <Link
                key={p.title}
                href={p.href}
                className="group bg-white rounded-2xl border border-slate-200 p-6 hover:border-[#c8102e]/40 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-[#c8102e]/10 text-[#c8102e] flex items-center justify-center mb-4 group-hover:bg-[#c8102e] group-hover:text-white transition-colors">
                  <p.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-[#0a2540] mb-2">
                  {p.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {p.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0a2540]">
              Comment ça marche
            </h2>
            <p className="mt-4 text-slate-600">
              Un processus clair, transparent et entièrement suivi depuis votre
              espace personnel.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s) => (
              <div key={s.number} className="relative">
                <div className="text-5xl font-bold text-[#c8102e]/15 mb-3">
                  {s.number}
                </div>
                <h3 className="text-lg font-semibold text-[#0a2540] mb-2">
                  {s.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#0a2540] mb-6">
                Un accompagnement pensé pour vous
              </h2>
              <ul className="space-y-4">
                {[
                  'Espace client sécurisé avec suivi en temps réel',
                  'Messagerie privée avec notre équipe',
                  'Dossiers individuels ou familiaux (jusqu’à 13 personnes)',
                  'Sauvegarde automatique des brouillons',
                  'Notifications de chaque changement de statut',
                  'Transparence totale sur les limites de notre service',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 mt-8 px-6 py-3 text-sm font-semibold text-white bg-[#c8102e] hover:bg-[#9b0c24] rounded-lg shadow-md transition-all"
              >
                Créer mon compte
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <Clock className="w-8 h-8 text-[#c8102e] mb-3" />
                <h3 className="font-semibold text-[#0a2540]">Suivi clair</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Statuts détaillés et historique complet de votre dossier.
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mt-8">
                <MessageSquare className="w-8 h-8 text-[#c8102e] mb-3" />
                <h3 className="font-semibold text-[#0a2540]">Messagerie</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Posez vos questions et recevez des réponses personnalisées.
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <Users className="w-8 h-8 text-[#c8102e] mb-3" />
                <h3 className="font-semibold text-[#0a2540]">Famille</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Jusqu’à 13 personnes dans un même projet.
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mt-8">
                <Shield className="w-8 h-8 text-[#c8102e] mb-3" />
                <h3 className="font-semibold text-[#0a2540]">Sécurité</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Données protégées et accès strictement contrôlés.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <HelpCircle className="w-10 h-10 text-[#c8102e] mx-auto mb-4" />
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0a2540]">
              Questions fréquentes
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group bg-slate-50 rounded-xl border border-slate-200 overflow-hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer px-6 py-4 font-medium text-[#0a2540] list-none">
                  {faq.q}
                  <span className="text-slate-400 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <div className="px-6 pb-4 text-sm text-slate-600 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/faq"
              className="text-sm font-medium text-[#c8102e] hover:underline"
            >
              Voir toutes les questions →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-16 lg:py-20 bg-gradient-to-r from-[#0a2540] to-[#1e3a5f] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Prêt à démarrer votre projet ?
          </h2>
          <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
            Créez votre compte en quelques minutes et commencez à constituer
            votre dossier d’accompagnement. Notre équipe examinera votre
            demande avec attention.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-[#c8102e] hover:bg-[#9b0c24] rounded-xl shadow-lg transition-all"
          >
            Commencer ma demande
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
