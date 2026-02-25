import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hunvecvcfadvwpkhpdke.supabase.co'
const supabaseAnonKey = 'sb_publishable_92yksCU07wRO10oqUN6IvQ_bdvb2UOz'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
