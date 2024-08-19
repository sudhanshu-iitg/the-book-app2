import React from 'react';
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_supabaseUrl;
const supabaseKey = process.env.REACT_APP_supabaseKey;

const supabase = createClient(supabaseUrl, supabaseKey);

function SignOutButton() {
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out: ', error);
  };

  return <button onClick={handleSignOut}>Sign Out</button>;
}

export default SignOutButton;