import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  requestId: string
  newStatus: string
  userEmail: string
  userName: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { requestId, newStatus, userEmail, userName } = await req.json() as RequestBody

    // Here you would integrate with your email service
    console.log('Sending status change notification:', {
      requestId,
      newStatus,
      userEmail,
      userName
    })

    // Example email template
    const emailContent = `
      <h1>Pickup Request Status Update</h1>
      <p>Dear ${userName},</p>
      <p>Your pickup request (ID: ${requestId}) has been updated to: <strong>${newStatus}</strong></p>
      ${
        newStatus === 'accepted'
          ? '<p>A recycler will contact you shortly to arrange the pickup time.</p>'
          : newStatus === 'completed'
          ? '<p>Thank you for contributing to e-waste recycling!</p>'
          : ''
      }
      <p>Thank you for using our service.</p>
    `

    return new Response(
      JSON.stringify({ message: 'Status change notification sent successfully' }),
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