'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestPage() {
    const [status, setStatus] = useState<string>('Testing...')
    const [data, setData] = useState<any>(null)

    useEffect(() => {
        async function checkConnection() {
            try {
                const supabase = createClient()
                const { data: shops, error } = await supabase.from('shops').select('*').limit(1)
                if (error) throw error

                setStatus('✅ Connection Successful!')
                setData(shops)
            } catch (err: any) {
                setStatus(`❌ Connection Failed: ${err.message}`)
            }
        }
        checkConnection()
    }, [])

    return (
        <div className="p-10">
            <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
            <p className="mb-4 text-xl">{status}</p>
            {data && (
                <pre className="bg-gray-100 p-4 rounded">
                    {JSON.stringify(data, null, 2)}
                </pre>
            )}
        </div>
    )
}
