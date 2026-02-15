import { createClient } from "@supabase/supabase-js";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      userId,
      email,
      firstName,
      lastName,
      role,
      about,
      country,
      state,
      college,
      specialization,
      skills,
      company,
      jobRole,
    } = body;

    if (!userId || !email) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Use service role key to bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );

    // 1. Create/update profile with 15 free GC-Tokens
    const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
      [
        {
          id: userId,
          email: email,
          first_name: firstName,
          last_name: lastName,
          role: role,
          about: about || null,
          country: country || null,
          state: state || null,
          college: role === "student" ? college : null,
          specialization: role === "student" ? specialization : null,
          skills: role === "student" ? skills : null,
          company: role === "professional" ? company : null,
          job_role: role === "professional" ? jobRole : null,
          gc_token_balance: 15,
        },
      ],
      { onConflict: "id" },
    );

    if (profileError) {
      console.error("Profile creation error:", profileError);
      return Response.json(
        { error: "Failed to create profile: " + profileError.message },
        { status: 500 },
      );
    }

    // 2. Log the welcome bonus transaction
    const { error: txError } = await supabaseAdmin
      .from("gc_transactions")
      .insert([
        {
          user_id: userId,
          amount: 15,
          type: "earned",
          description: "🎉 Welcome bonus — 15 free GC-Tokens!",
        },
      ]);

    if (txError) {
      console.error("Transaction log error:", txError);
      // Non-critical — profile was created, tokens are set
    }

    return Response.json({ success: true, gc_tokens: 15 });
  } catch (error) {
    console.error("Create profile error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
