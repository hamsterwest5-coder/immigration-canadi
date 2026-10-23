import Link from 'next/link'
import { Mail, MapPin, Shield } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#0a2540] text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#c8102e] flex items-center justify-center">
                <span className="text-white font-bold text-lg">CA</span>
              </div>
              <span className="font-semibold text-white text-lg">
                Canada Immigration
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Plateforme privée d’accompagnement professionnel pour vos projets
              d’immigration au Canada. Nous vous guidons à chaque étape avec
              sérieux et transparence.
            </p>
            <div className="flex items-start gap-2 text-xs text-amber-200/90 bg-amber-900/30 border border-amber-700/40 rounded-lg p-3">
              <Shield className="w-4 h-4 mt-0.5 shrink-0" />
              <span>
                Ce site est une plateforme privée d’accompagnement. Il n’est
                pas un site officiel du gouvernement du Canada et ne prétend
                à aucun partenariat gouvernemental.
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/programmes" className="hover:text-white transition-colors">
                  Nos programmes
                </Link>
              </li>
              <li>
                <Link href="/comment-ca-marche" className="hover:text-white transition-colors">
                  Comment ça marche
                </Link>
              </li>
              <li>
                <Link href="/a-propos" className="hover:text-white transition-colors">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Informations légales</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/mentions-legales" className="hover:text-white transition-colors">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/politique-confidentialite" className="hover:text-white transition-colors">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link href="/conditions-utilisation" className="hover:text-white transition-colors">
                  Conditions d’utilisation
                </Link>
              </li>
              <li>
                <Link href="/conditions-service" className="hover:text-white transition-colors">
                  Conditions générales de service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" />
                <span>contact@votredomaine.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" />
                <span>
                  Coordonnées à compléter<br />
                  (adresse réelle de l’entreprise)
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-700/50 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} Canada Immigration Accompagnement. Tous
            droits réservés.
          </p>
          <p className="text-center sm:text-right max-w-md">
            Les décisions d’immigration relèvent exclusivement des autorités
            canadiennes compétentes. Notre accompagnement est privé et
            indépendant.
          </p>
        </div>
      </div>
    </footer>
  )
}
