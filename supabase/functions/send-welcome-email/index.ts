import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { email, fullName } = await req.json();

    console.log(`Welcome email triggered for: ${email} (${fullName})`);

    const emailContent = `
Welcome to our Research Peptide Platform!

Hello ${fullName},

Your researcher account has been successfully created and approved!

Login Credentials:
- Email: ${email}
- Password: (the one you created during registration)

You can now:
- Browse our complete peptide catalog
- Add products to your cart
- Place orders for research peptides

All products are FOR RESEARCH USE ONLY and are not intended for human consumption.

Visit our platform to get started: ${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '') || 'https://your-platform.com'}

Thank you for choosing our platform for your research needs.

Best regards,
Research Peptide Platform Team
    `.trim();

    console.log('Email content prepared:', emailContent);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Welcome email logged',
        email: email
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error('Error processing welcome email:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
