import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cmxivkphfhxtxhaqevch.supabase.co'
const supabaseKey = 'sb_publishable_G2WC5Z0MrSeqQHqy8PxU0Q_vFy49Lcv'

export const supabase = createClient(supabaseUrl, supabaseKey)
