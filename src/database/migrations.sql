CREATE TABLE public.association_members (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  association_id uuid NULL,
  profile_id bigint NULL,
  role text NULL DEFAULT 'member'::text,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT association_members_pkey PRIMARY KEY (id),
  CONSTRAINT association_members_association_id_profile_id_key UNIQUE (association_id, profile_id),
  CONSTRAINT association_members_association_id_fkey FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE,
  CONSTRAINT association_members_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE TABLE public.associations (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  name text NOT NULL,
  description text NULL,
  image_url text NULL,
  is_public boolean NULL DEFAULT true,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  type text NULL,
  CONSTRAINT associations_pkey PRIMARY KEY (id),
  CONSTRAINT associations_type_check CHECK ((type = ANY (ARRAY['association'::text, 'etudiant'::text])))
);

CREATE TABLE public.conversation_participants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL,
  profile_id bigint NOT NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  last_read timestamp without time zone NULL,
  CONSTRAINT conversation_participants_pkey PRIMARY KEY (id),
  CONSTRAINT conversation_participants_conversation_id_user_id_key UNIQUE (conversation_id, profile_id),
  CONSTRAINT conversation_participants_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES conversations(id),
  CONSTRAINT conversation_participants_user_id_fkey FOREIGN KEY (profile_id) REFERENCES profiles(id)
);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON public.conversation_participants USING btree (profile_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON public.conversation_participants USING btree (conversation_id);

CREATE TABLE public.conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  name text NULL,
  CONSTRAINT conversations_pkey PRIMARY KEY (id)
);

CREATE TABLE public.event_participants (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  event_id uuid NULL,
  profile_id bigint NULL,
  status text NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT event_participants_pkey PRIMARY KEY (id),
  CONSTRAINT event_participants_event_id_profile_id_key UNIQUE (event_id, profile_id),
  CONSTRAINT event_participants_event_id_fkey FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  CONSTRAINT event_participants_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT event_participants_status_check CHECK ((status = ANY (ARRAY['going'::text, 'interested'::text, 'not_going'::text])))
);

CREATE TABLE public.events (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  association_id uuid NULL,
  title text NOT NULL,
  description text NULL,
  location text NULL,
  image_url text NULL,
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  created_by bigint NULL,
  CONSTRAINT events_pkey PRIMARY KEY (id),
  CONSTRAINT events_association_id_fkey FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE,
  CONSTRAINT events_created_by_fkey FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL,
  profile_id bigint NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  is_read boolean NULL,
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES conversations(id),
  CONSTRAINT messages_user_id_fkey FOREIGN KEY (profile_id) REFERENCES profiles(id)
);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages USING btree (conversation_id);

CREATE TABLE public.post_comments (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  post_id uuid NULL,
  profile_id bigint NULL,
  content text NOT NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT post_comments_pkey PRIMARY KEY (id),
  CONSTRAINT post_comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  CONSTRAINT post_comments_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE TABLE public.post_likes (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  post_id uuid NULL,
  profile_id bigint NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT post_likes_pkey PRIMARY KEY (id),
  CONSTRAINT post_likes_post_id_profile_id_key UNIQUE (post_id, profile_id),
  CONSTRAINT post_likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  CONSTRAINT post_likes_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE TABLE public.posts (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  association_id uuid NULL,
  profile_id bigint NULL,
  content text NOT NULL,
  image_url text NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT posts_pkey PRIMARY KEY (id),
  CONSTRAINT posts_association_id_fkey FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE,
  CONSTRAINT posts_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE TABLE public.profiles (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  first_name text NULL,
  last_name text NULL,
  email text NULL,
  avatar_url text NULL,
  user_id uuid NULL,
  created_at date NULL,
  updated_at date NULL,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_user_id_key UNIQUE (user_id),
  CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);