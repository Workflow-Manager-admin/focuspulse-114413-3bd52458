# Supabase Integration for FocusTimer Pomodoro App

## Setup Steps

1. **Create Supabase Project**:  
   Go to [Supabase](https://app.supabase.com/) and create a new project.

2. **Copy API Keys**:  
   - Get the **Project URL** and **Anon Public Key** from your Supabase project's settings.
   - Set these values in a `.env` file in your React project:

     ```
     REACT_APP_SUPABASE_URL=your-supabase-url
     REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
     ```

3. **Enable Auth Providers**:  
   - Email/password authentication must be enabled.  
   - No invite or email confirmation required for this demo (optional: disable confirmation emails for quick sign up in Auth settings).

4. **Create `sessions` Table**:  
   Add a table named `sessions` for storing Pomodoro logs.

   SQL to run in the SQL editor:
   ```sql
   create table if not exists sessions (
     id uuid primary key default uuid_generate_v4(),
     user_id uuid references auth.users not null,
     focus int not null,
     break int not null,
     timestamp timestamptz default now()
   );
   ```

5. **Row Level Security (RLS):**  
   - Enable RLS on `sessions`.
   - Add policy allowing users to insert/select their own rows:
     ```sql
     create policy "Users can insert/select their own logs" on sessions
       for all
       using (auth.uid() = user_id);
     ```

6. **Storage**:  
   No extra configuration is required.

## App Usage

- All session logs are tied to the currently authenticated user's `user.id`.
- On timer completion, sessions are inserted into the `sessions` table.
- Logs are retrieved with `select * from sessions where user_id = ... order by timestamp desc`.

## Libraries
- Uses [`@supabase/supabase-js`](https://supabase.com/docs/reference/javascript/introduction) (v2+) in React app for client-side operations.

## Environment Variables

Keep `.env` (or `.env.example`) safe; never commit actual keys to public repositories.

```
REACT_APP_SUPABASE_URL=your-supabase-url
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Notes

- On local development, restart React (`npm start`) after editing `.env`.
- All Supabase calls are directly from client; RLS must be correctly set for privacy.

