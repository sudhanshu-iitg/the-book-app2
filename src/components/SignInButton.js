import React from 'react';
import { createClient } from "@supabase/supabase-js";
const supabaseUrl = process.env.REACT_APP_supabaseUrl;
const supabaseKey = process.env.REACT_APP_supabaseKey;
const supabase = createClient(supabaseUrl, supabaseKey);

function SignInButton() {
  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) console.error('Error: ', error);
  };

  return <button onClick={handleSignIn}>Sign in with Google</button>;
}

export default SignInButton;