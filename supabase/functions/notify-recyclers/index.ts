// Follow this TypeScript implementation for the Edge Function

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PickupRequest {
  id: string
  items: string
  quantity: number
  address: string
  status: string
  notes?: string
  user_name: string
  user_email: string
  created_at: string
}

interface RequestBody {
  pickupRequest: PickupRequest
  recyclers: string[]
  userName: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { pickupRequest, recyclers, userName } = await req.json() as RequestBody

    // Here you would integrate with your email service (e.g., Resend, SendGrid)
    // For now, we'll log the notification
    console.log('Sending notifications to recyclers:', {
      recyclers,
      pickupRequest,
      userName
    })

    // In production, you would send actual emails here
    // Example with a hypothetical email service:
    /*
    for (const recyclerEmail of recyclers) {
      await emailService.send({
        to: recyclerEmail,
        subject: 'New Pickup Request',
        html: `
          <h1>New Pickup Request from ${userName}</h1>
          <p>Items: ${pickupRequest.items}</p>
          <p>Quantity: ${pickupRequest.quantity}</p>
          <p>Address: ${pickupRequest.address}</p>
          <p>Notes: ${pickupRequest.notes || 'None'}</p>
          <p>Contact: ${pickupRequest.user_email}</p>
        `
      })
    }
    */

    return new Response(
      JSON.stringify({ message: 'Notifications sent successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})