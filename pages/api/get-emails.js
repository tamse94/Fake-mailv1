import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  const { address } = req.query

  if (!address) {
    return res.status(400).json({ error: 'Alamat email diperlukan' })
  }

  // Mengambil data email dari tabel 'inbox' berdasarkan alamat tujuan
  const { data, error } = await supabase
    .from('inbox')
    .select('*')
    .eq('recipient', address)
    .order('created_at', { ascending: false })

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  return res.status(200).json(data)
}
