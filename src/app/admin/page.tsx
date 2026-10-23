'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Users,
  FileText,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  LogOut,
} from 'lucide-react'
import Button from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import {
  Application,
  STATUS_LABELS,
  STATUS_COLORS,
  PROGRAM_LABELS,
  ApplicationStatus,
} from '@/types/database'
import { formatDate } from '@/lib/utils'

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [stats, setStats] = useState({
    totalClients: 0,
    totalApps: 0,
    soumises: 0,
    enExamen: 0,
    infosComp: 0,
    approuvees: 0,
    refusees: 0,
  })
  const [applications, setApplications] = useState<Application[]>([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('')

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        router.push('/client')
        return
      }
      setIsAdmin(true)

      // Stats
      const { count: clientCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'client')

      const { data: apps } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false })

      setApplications(apps || [])
      setStats({
        totalClients: clientCount || 0,
        totalApps: apps?.length || 0,
        soumises: apps?.filter((a) => a.status === 'soumise').length || 0,
        enExamen: apps?.filter((a) => a.status === 'en_examen').length || 0,
        infosComp: apps?.filter((a) => a.status === 'infos_complementaires').length || 0,
        approuvees: apps?.filter((a) => a.status === 'approuvee_interne').length || 0,
        refusees: apps?.filter((a) => a.status === 'refusee_interne').length || 0,
      })

      setLoading(false)
    }
    load()
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const filtered = applications.filter((app) => {
    const matchSearch =
      !search ||
      app.application_number.toLowerCase().includes(search.toLowerCase()) ||
      app.user_id.includes(search)
    const matchStatus = !filterStatus || app.status === filterStatus
    return matchSearch && matchStatus
  })

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-slate-500">Chargement administration…</div>
      </div>
    )
  }

  if (!isAdmin) return null

  return (
    <div className="min-h-[80vh] bg-slate-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0a2540]">
              Administration
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Gestion des dossiers et des clients – @Jenpaul2
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            Déconnexion
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
          {[
            { label: 'Clients', value: stats.totalClients, icon: Users, color: 'text-blue-600' },
            { label: 'Dossiers', value: stats.totalApps, icon: FileText, color: 'text-slate-700' },
            { label: 'Soumises', value: stats.soumises, icon: Clock, color: 'text-blue-600' },
            { label: 'En examen', value: stats.enExamen, icon: AlertCircle, color: 'text-indigo-600' },
            { label: 'Infos req.', value: stats.infosComp, icon: MessageSquare, color: 'text-amber-600' },
            { label: 'Approuvées', value: stats.approuvees, icon: CheckCircle2, color: 'text-emerald-600' },
            { label: 'Refusées', value: stats.refusees, icon: XCircle, color: 'text-red-600' },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-xl border border-slate-200 p-4 text-center"
            >
              <s.icon className={`w-5 h-5 mx-auto mb-1 ${s.color}`} />
              <p className="text-2xl font-bold text-[#0a2540]">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par n° de dossier…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#c8102e]/30 focus:border-[#c8102e]"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-slate-300 bg-white"
          >
            <option value="">Tous les statuts</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>

        {/* Applications table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">N° dossier</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Programme</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Personnes</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Statut</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Date</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                      Aucun dossier trouvé
                    </td>
                  </tr>
                ) : (
                  filtered.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-[#0a2540]">
                        {app.application_number}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {PROGRAM_LABELS[app.program]}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {app.number_of_persons}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                            STATUS_COLORS[app.status]
                          }`}
                        >
                          {STATUS_LABELS[app.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {formatDate(app.submitted_at || app.created_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/admin/dossier/${app.id}`}>
                          <Button variant="outline" size="sm">
                            Ouvrir
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-6 text-xs text-slate-500 text-center">
          Les décisions « Approuvée / Refusée » sont internes à l’accompagnement.
          Elles ne constituent en aucun cas une décision officielle des autorités
          canadiennes d’immigration.
        </p>
      </div>
    </div>
  )
}
