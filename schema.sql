--
-- PostgreSQL database dump
--

\restrict OefWsHbiL0R8lWcdFlGuNTThB2cdatBz3dIGvqmeePYQY6a6uwuwiqOiN2W4aSj

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: update_album_rating(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_album_rating() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Recalculate average rating and count for the album
    UPDATE albums
    SET 
        average_rating = (
            SELECT COALESCE(AVG(rating), 0)
            FROM reviews
            WHERE album_id = COALESCE(NEW.album_id, OLD.album_id)
            AND is_public = true
        ),
        rating_count = (
            SELECT COUNT(*)
            FROM reviews
            WHERE album_id = COALESCE(NEW.album_id, OLD.album_id)
            AND is_public = true
        )
    WHERE album_id = COALESCE(NEW.album_id, OLD.album_id);
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_album_rating() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: album_listens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.album_listens (
    listen_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    album_id uuid,
    listened_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.album_listens OWNER TO postgres;

--
-- Name: albums; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.albums (
    album_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying(255) NOT NULL,
    artist_id uuid,
    release_date date,
    cover_art_url character varying(500),
    spotify_id character varying(100),
    genre character varying(100),
    average_rating numeric(3,1) DEFAULT 0,
    rating_count integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.albums OWNER TO postgres;

--
-- Name: artists; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.artists (
    artist_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    bio text,
    image_url character varying(500),
    spotify_id character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.artists OWNER TO postgres;

--
-- Name: follows; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.follows (
    follow_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    follower_id uuid,
    following_id uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT follows_check CHECK ((follower_id <> following_id))
);


ALTER TABLE public.follows OWNER TO postgres;

--
-- Name: list_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.list_items (
    list_item_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    list_id uuid,
    album_id uuid,
    "position" integer,
    added_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.list_items OWNER TO postgres;

--
-- Name: lists; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lists (
    list_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    title character varying(255) NOT NULL,
    description text,
    is_public boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.lists OWNER TO postgres;

--
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    review_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    album_id uuid,
    rating numeric(3,1),
    review_text text,
    is_public boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reviews_rating_check CHECK (((rating >= (0)::numeric) AND (rating <= (10)::numeric)))
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- Name: song_listens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.song_listens (
    listen_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    song_id uuid,
    listened_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.song_listens OWNER TO postgres;

--
-- Name: song_reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.song_reviews (
    review_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    song_id uuid,
    rating numeric(3,1),
    review_text text,
    is_public boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT song_reviews_rating_check CHECK (((rating >= (0)::numeric) AND (rating <= (10)::numeric)))
);


ALTER TABLE public.song_reviews OWNER TO postgres;

--
-- Name: songs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.songs (
    song_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying(255) NOT NULL,
    artist_id uuid,
    album_id uuid,
    duration_seconds integer,
    track_number integer,
    spotify_id character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.songs OWNER TO postgres;

--
-- Name: user_album_stats; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_album_stats (
    stat_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    total_albums_listened integer DEFAULT 0,
    total_albums_rated integer DEFAULT 0,
    average_rating_given numeric(3,1) DEFAULT 0,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_album_stats OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    display_name character varying(100),
    bio text,
    profile_picture_url character varying(500),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: album_listens album_listens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.album_listens
    ADD CONSTRAINT album_listens_pkey PRIMARY KEY (listen_id);


--
-- Name: albums albums_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.albums
    ADD CONSTRAINT albums_pkey PRIMARY KEY (album_id);


--
-- Name: albums albums_spotify_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.albums
    ADD CONSTRAINT albums_spotify_id_key UNIQUE (spotify_id);


--
-- Name: artists artists_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.artists
    ADD CONSTRAINT artists_pkey PRIMARY KEY (artist_id);


--
-- Name: artists artists_spotify_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.artists
    ADD CONSTRAINT artists_spotify_id_key UNIQUE (spotify_id);


--
-- Name: follows follows_follower_id_following_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT follows_follower_id_following_id_key UNIQUE (follower_id, following_id);


--
-- Name: follows follows_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT follows_pkey PRIMARY KEY (follow_id);


--
-- Name: list_items list_items_list_id_album_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.list_items
    ADD CONSTRAINT list_items_list_id_album_id_key UNIQUE (list_id, album_id);


--
-- Name: list_items list_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.list_items
    ADD CONSTRAINT list_items_pkey PRIMARY KEY (list_item_id);


--
-- Name: lists lists_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lists
    ADD CONSTRAINT lists_pkey PRIMARY KEY (list_id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (review_id);


--
-- Name: reviews reviews_user_id_album_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_album_id_key UNIQUE (user_id, album_id);


--
-- Name: song_listens song_listens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.song_listens
    ADD CONSTRAINT song_listens_pkey PRIMARY KEY (listen_id);


--
-- Name: song_reviews song_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.song_reviews
    ADD CONSTRAINT song_reviews_pkey PRIMARY KEY (review_id);


--
-- Name: song_reviews song_reviews_user_id_song_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.song_reviews
    ADD CONSTRAINT song_reviews_user_id_song_id_key UNIQUE (user_id, song_id);


--
-- Name: songs songs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.songs
    ADD CONSTRAINT songs_pkey PRIMARY KEY (song_id);


--
-- Name: songs songs_spotify_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.songs
    ADD CONSTRAINT songs_spotify_id_key UNIQUE (spotify_id);


--
-- Name: user_album_stats user_album_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_album_stats
    ADD CONSTRAINT user_album_stats_pkey PRIMARY KEY (stat_id);


--
-- Name: user_album_stats user_album_stats_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_album_stats
    ADD CONSTRAINT user_album_stats_user_id_key UNIQUE (user_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_album_listens_album; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_album_listens_album ON public.album_listens USING btree (album_id);


--
-- Name: idx_album_listens_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_album_listens_user ON public.album_listens USING btree (user_id);


--
-- Name: idx_albums_artist; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_albums_artist ON public.albums USING btree (artist_id);


--
-- Name: idx_follows_follower; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_follows_follower ON public.follows USING btree (follower_id);


--
-- Name: idx_follows_following; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_follows_following ON public.follows USING btree (following_id);


--
-- Name: idx_reviews_album; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reviews_album ON public.reviews USING btree (album_id);


--
-- Name: idx_reviews_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reviews_user ON public.reviews USING btree (user_id);


--
-- Name: idx_song_listens_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_song_listens_user ON public.song_listens USING btree (user_id);


--
-- Name: idx_songs_album; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_songs_album ON public.songs USING btree (album_id);


--
-- Name: idx_songs_artist; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_songs_artist ON public.songs USING btree (artist_id);


--
-- Name: reviews trigger_update_album_rating; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_album_rating AFTER INSERT OR DELETE OR UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_album_rating();


--
-- Name: album_listens album_listens_album_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.album_listens
    ADD CONSTRAINT album_listens_album_id_fkey FOREIGN KEY (album_id) REFERENCES public.albums(album_id) ON DELETE CASCADE;


--
-- Name: album_listens album_listens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.album_listens
    ADD CONSTRAINT album_listens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: albums albums_artist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.albums
    ADD CONSTRAINT albums_artist_id_fkey FOREIGN KEY (artist_id) REFERENCES public.artists(artist_id) ON DELETE CASCADE;


--
-- Name: follows follows_follower_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT follows_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: follows follows_following_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT follows_following_id_fkey FOREIGN KEY (following_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: list_items list_items_album_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.list_items
    ADD CONSTRAINT list_items_album_id_fkey FOREIGN KEY (album_id) REFERENCES public.albums(album_id) ON DELETE CASCADE;


--
-- Name: list_items list_items_list_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.list_items
    ADD CONSTRAINT list_items_list_id_fkey FOREIGN KEY (list_id) REFERENCES public.lists(list_id) ON DELETE CASCADE;


--
-- Name: lists lists_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lists
    ADD CONSTRAINT lists_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: reviews reviews_album_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_album_id_fkey FOREIGN KEY (album_id) REFERENCES public.albums(album_id) ON DELETE CASCADE;


--
-- Name: reviews reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: song_listens song_listens_song_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.song_listens
    ADD CONSTRAINT song_listens_song_id_fkey FOREIGN KEY (song_id) REFERENCES public.songs(song_id) ON DELETE CASCADE;


--
-- Name: song_listens song_listens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.song_listens
    ADD CONSTRAINT song_listens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: song_reviews song_reviews_song_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.song_reviews
    ADD CONSTRAINT song_reviews_song_id_fkey FOREIGN KEY (song_id) REFERENCES public.songs(song_id) ON DELETE CASCADE;


--
-- Name: song_reviews song_reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.song_reviews
    ADD CONSTRAINT song_reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: songs songs_album_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.songs
    ADD CONSTRAINT songs_album_id_fkey FOREIGN KEY (album_id) REFERENCES public.albums(album_id) ON DELETE SET NULL;


--
-- Name: songs songs_artist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.songs
    ADD CONSTRAINT songs_artist_id_fkey FOREIGN KEY (artist_id) REFERENCES public.artists(artist_id) ON DELETE CASCADE;


--
-- Name: user_album_stats user_album_stats_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_album_stats
    ADD CONSTRAINT user_album_stats_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict OefWsHbiL0R8lWcdFlGuNTThB2cdatBz3dIGvqmeePYQY6a6uwuwiqOiN2W4aSj

