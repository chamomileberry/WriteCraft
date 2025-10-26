--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (165f042)
-- Dumped by pg_dump version 16.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accessories; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.accessories (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    accessory_type text NOT NULL,
    description text NOT NULL,
    materials text[],
    value text,
    rarity text,
    enchantments text[],
    cultural_significance text,
    history text,
    appearance text,
    functionality text,
    genre text,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    notebook_id character varying
);


ALTER TABLE public.accessories OWNER TO neondb_owner;

--
-- Name: ai_usage_daily_summary; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.ai_usage_daily_summary (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    date text NOT NULL,
    total_operations integer DEFAULT 0,
    total_input_tokens integer DEFAULT 0,
    total_output_tokens integer DEFAULT 0,
    total_cost_cents integer DEFAULT 0,
    operations_breakdown jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.ai_usage_daily_summary OWNER TO neondb_owner;

--
-- Name: ai_usage_logs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.ai_usage_logs (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    operation_type character varying NOT NULL,
    model character varying NOT NULL,
    input_tokens integer NOT NULL,
    output_tokens integer NOT NULL,
    cached_tokens integer DEFAULT 0,
    estimated_cost_cents integer NOT NULL,
    project_id character varying,
    notebook_id character varying,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.ai_usage_logs OWNER TO neondb_owner;

--
-- Name: animals; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.animals (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    animal_type text NOT NULL,
    description text NOT NULL,
    habitat text,
    diet text,
    behavior text,
    physical_traits text,
    size text,
    domestication text,
    intelligence text,
    abilities text[],
    lifecycle text,
    cultural_role text,
    threats text,
    genre text,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    notebook_id character varying
);


ALTER TABLE public.animals OWNER TO neondb_owner;

--
-- Name: api_key_rotation_audit; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.api_key_rotation_audit (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    key_rotation_id character varying NOT NULL,
    action character varying NOT NULL,
    performed_by character varying,
    notes text,
    "timestamp" timestamp without time zone DEFAULT now()
);


ALTER TABLE public.api_key_rotation_audit OWNER TO neondb_owner;

--
-- Name: api_key_rotations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.api_key_rotations (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    key_name character varying NOT NULL,
    key_type character varying NOT NULL,
    description text,
    rotation_interval_days integer DEFAULT 90 NOT NULL,
    last_rotated_at timestamp without time zone DEFAULT now(),
    next_rotation_due timestamp without time zone NOT NULL,
    rotation_status character varying DEFAULT 'current'::character varying NOT NULL,
    notification_sent boolean DEFAULT false,
    last_notification_sent_at timestamp without time zone,
    rotation_count integer DEFAULT 0,
    last_rotated_by character varying,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.api_key_rotations OWNER TO neondb_owner;

--
-- Name: api_key_usage_logs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.api_key_usage_logs (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    api_key_id character varying NOT NULL,
    user_id character varying NOT NULL,
    endpoint text NOT NULL,
    method character varying(10) NOT NULL,
    status_code integer NOT NULL,
    response_time integer,
    ip_address character varying,
    user_agent text,
    error_message text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.api_key_usage_logs OWNER TO neondb_owner;

--
-- Name: api_keys; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.api_keys (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    name text NOT NULL,
    key_hash text NOT NULL,
    prefix character varying(16) NOT NULL,
    scope character varying DEFAULT 'read'::character varying NOT NULL,
    allowed_endpoints text[],
    monthly_rate_limit integer DEFAULT 5000 NOT NULL,
    current_month_usage integer DEFAULT 0 NOT NULL,
    last_used_at timestamp without time zone,
    usage_reset_date timestamp without time zone NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    expires_at timestamp without time zone,
    revoked_at timestamp without time zone,
    revoked_reason text,
    last_rotated_at timestamp without time zone,
    ip_whitelist text[],
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.api_keys OWNER TO neondb_owner;

--
-- Name: armor; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.armor (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    armor_type text NOT NULL,
    description text NOT NULL,
    protection text,
    weight text,
    materials text[],
    coverage text,
    mobility text,
    enchantments text[],
    craftsmanship text,
    history text,
    rarity text,
    value text,
    maintenance text,
    genre text,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    notebook_id character varying
);


ALTER TABLE public.armor OWNER TO neondb_owner;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.audit_logs (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    team_subscription_id character varying NOT NULL,
    user_id character varying,
    action character varying NOT NULL,
    resource_type character varying NOT NULL,
    resource_id character varying,
    resource_name text,
    changes_before jsonb,
    changes_after jsonb,
    ip_address character varying,
    user_agent text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.audit_logs OWNER TO neondb_owner;

--
-- Name: banned_phrases; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.banned_phrases (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    phrase text NOT NULL,
    category text NOT NULL,
    replacement text,
    is_active boolean DEFAULT true,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.banned_phrases OWNER TO neondb_owner;

--
-- Name: billing_alerts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.billing_alerts (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    type character varying NOT NULL,
    severity character varying DEFAULT 'medium'::character varying NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    stripe_invoice_id character varying,
    stripe_subscription_id character varying,
    status character varying DEFAULT 'unread'::character varying NOT NULL,
    dismissed_at timestamp without time zone,
    resolved_at timestamp without time zone,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.billing_alerts OWNER TO neondb_owner;

--
-- Name: buildings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.buildings (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    building_type text NOT NULL,
    description text NOT NULL,
    architecture text,
    materials text[],
    purpose text,
    capacity text,
    defenses text,
    history text,
    current_condition text,
    location text,
    owner text,
    significance text,
    secrets text,
    genre text,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    notebook_id character varying
);


ALTER TABLE public.buildings OWNER TO neondb_owner;

--
-- Name: canvases; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.canvases (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    data text DEFAULT '{"elements":[],"appState":{},"files":{}}'::text NOT NULL,
    project_id character varying,
    tags text[],
    is_template boolean DEFAULT false,
    user_id character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.canvases OWNER TO neondb_owner;

--
-- Name: ceremonies; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.ceremonies (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    ceremony_type text NOT NULL,
    description text NOT NULL,
    purpose text NOT NULL,
    participants text[],
    officiant text,
    location text,
    duration text,
    season text,
    frequency text,
    traditions text[],
    symbolism text[],
    required_items text[],
    dress text,
    music text,
    food text,
    gifts text,
    significance text,
    restrictions text[],
    variations text,
    genre text,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    notebook_id character varying
);


ALTER TABLE public.ceremonies OWNER TO neondb_owner;

--
-- Name: characters; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.characters (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    age integer,
    occupation text,
    personality text[],
    backstory text,
    motivation text,
    flaw text,
    strength text,
    genre text,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    gender text,
    height text,
    build text,
    hair_color text,
    eye_color text,
    skin_tone text,
    facial_features text,
    identifying_marks text,
    physical_description text,
    sex text,
    gender_identity text,
    physical_presentation text,
    hair_texture text,
    hair_style text,
    height_detail text,
    weight text,
    species text,
    ethnicity text,
    pronouns text,
    current_location text,
    conditions text,
    family text[],
    current_residence text,
    religious_belief text,
    affiliated_organizations text,
    given_name text,
    family_name text,
    middle_name text,
    maiden_name text,
    nickname text,
    honorific_title text,
    suffix text,
    prefix text,
    date_of_birth text,
    place_of_birth text,
    date_of_death text,
    place_of_death text,
    upbringing text,
    gender_understanding text,
    sexual_orientation text,
    education text,
    profession text,
    work_history text,
    accomplishments text,
    negative_events text,
    mental_health text,
    intellectual_traits text,
    values_ethics_morals text,
    frowned_upon_views text,
    languages text[],
    language_fluency_accent text,
    physical_condition text,
    distinctive_body_features text,
    facial_details text,
    striking_features text,
    marks_piercings_tattoos text,
    distinct_physical_features text,
    supernatural_powers text,
    special_abilities text,
    mutations text,
    typical_attire text,
    accessories text,
    key_equipment text,
    specialized_items text,
    main_skills text,
    strengths text,
    positive_aspects text,
    proficiencies text,
    lacking_skills text,
    lacking_knowledge text,
    character_flaws text,
    addictions text,
    vices text,
    defects text,
    secret_beliefs text,
    likes text,
    dislikes text,
    world_influence text,
    legacy text,
    remembered_by text[],
    behavioral_traits text,
    particularities text,
    hygiene_value text,
    famous_quotes text,
    catchphrases text,
    overseeing_domain text,
    leadership_group text,
    position_duration text,
    key_relationships text,
    allies text,
    enemies text,
    familial_ties text,
    religious_views text,
    spiritual_practices text,
    charisma text,
    confidence text,
    ego text,
    extroversion text,
    etiquette text,
    mannerisms text,
    habitual_gestures text,
    speaking_style text,
    behaving_style text,
    hobbies text,
    interests text,
    activities text,
    pets text,
    speech_particularities text,
    tone_of_voice text,
    voice_pitch text,
    accent text,
    dialect text,
    speech_impediments text,
    common_phrases text,
    compliments text,
    insults text,
    greetings text,
    farewells text,
    swearing text,
    metaphors text,
    wealth_class text,
    dependencies text,
    debts text,
    funds text,
    disposable_income text,
    assets text,
    investments text,
    notebook_id character varying,
    article_content text,
    image_url text,
    image_caption text,
    description text,
    import_source character varying,
    import_external_id character varying
);


ALTER TABLE public.characters OWNER TO neondb_owner;

--
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.chat_messages (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    guide_id character varying,
    type text NOT NULL,
    content text NOT NULL,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now(),
    project_id character varying,
    thread_id character varying
);


ALTER TABLE public.chat_messages OWNER TO neondb_owner;

--
-- Name: clothing; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.clothing (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    clothing_type text NOT NULL,
    description text NOT NULL,
    materials text[],
    style text,
    colors text[],
    social_class text,
    cultural_context text,
    climate text,
    occasion text,
    cost text,
    durability text,
    genre text,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    notebook_id character varying
);


ALTER TABLE public.clothing OWNER TO neondb_owner;

--
-- Name: conditions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.conditions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    condition_type text NOT NULL,
    description text NOT NULL,
    symptoms text[],
    causes text[],
    transmission text,
    duration text,
    severity text,
    effects text[],
    treatment text,
    cure text,
    prevention text,
    complications text[],
    mortality text,
    prevalence text,
    affected_species text[],
    cultural_impact text,
    historical_outbreaks text,
    genre text,
    notebook_id character varying,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.conditions OWNER TO neondb_owner;

--
-- Name: conflicts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.conflicts (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    type text NOT NULL,
    description text NOT NULL,
    stakes text NOT NULL,
    obstacles text[] NOT NULL,
    potential_resolutions text[] NOT NULL,
    emotional_impact text NOT NULL,
    genre text,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    article_content text,
    notebook_id character varying,
    image_url text,
    image_caption text
);


ALTER TABLE public.conflicts OWNER TO neondb_owner;

--
-- Name: conversation_summaries; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.conversation_summaries (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    project_id character varying,
    guide_id character varying,
    key_challenges text[] DEFAULT ARRAY[]::text[],
    breakthroughs text[] DEFAULT ARRAY[]::text[],
    recurring_questions text[] DEFAULT ARRAY[]::text[],
    last_discussed_topics text[] DEFAULT ARRAY[]::text[],
    writer_progress text,
    last_discussed timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.conversation_summaries OWNER TO neondb_owner;

--
-- Name: conversation_threads; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.conversation_threads (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    project_id character varying,
    guide_id character varying,
    title text NOT NULL,
    summary text,
    tags text[],
    parent_thread_id character varying,
    is_active boolean DEFAULT true,
    message_count integer DEFAULT 0,
    last_activity_at timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.conversation_threads OWNER TO neondb_owner;

--
-- Name: creatures; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.creatures (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    creature_type text NOT NULL,
    habitat text NOT NULL,
    physical_description text NOT NULL,
    abilities text[] NOT NULL,
    behavior text NOT NULL,
    cultural_significance text NOT NULL,
    genre text,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    article_content text,
    notebook_id character varying,
    image_url text,
    image_caption text
);


ALTER TABLE public.creatures OWNER TO neondb_owner;

--
-- Name: cultures; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.cultures (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    "values" text[],
    beliefs text[],
    traditions text[],
    social_norms text[],
    language text,
    arts text,
    technology text,
    governance text,
    economy text,
    education text,
    family text,
    ceremonies text[],
    genre text,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    notebook_id character varying,
    article_content text,
    image_url text,
    image_caption text
);


ALTER TABLE public.cultures OWNER TO neondb_owner;

--
-- Name: dances; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.dances (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    dance_type text NOT NULL,
    description text NOT NULL,
    origin text,
    movements text[],
    formations text[],
    participants text,
    music text,
    costumes text,
    props text[],
    occasion text,
    difficulty text,
    duration text,
    symbolism text,
    cultural_significance text,
    restrictions text,
    variations text[],
    teaching_methods text,
    genre text,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    notebook_id character varying
);


ALTER TABLE public.dances OWNER TO neondb_owner;

--
-- Name: descriptions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.descriptions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    description_type text NOT NULL,
    genre text,
    tags text[] NOT NULL,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    notebook_id character varying
);


ALTER TABLE public.descriptions OWNER TO neondb_owner;

--
-- Name: discount_code_usage; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.discount_code_usage (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    discount_code_id character varying NOT NULL,
    user_id character varying NOT NULL,
    subscription_id character varying,
    discount_amount integer NOT NULL,
    used_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.discount_code_usage OWNER TO neondb_owner;

--
-- Name: discount_codes; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.discount_codes (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    code character varying NOT NULL,
    name text NOT NULL,
    type character varying NOT NULL,
    value integer NOT NULL,
    applicable_tiers text[] NOT NULL,
    max_uses integer,
    current_uses integer DEFAULT 0 NOT NULL,
    max_uses_per_user integer DEFAULT 1 NOT NULL,
    duration character varying DEFAULT 'once'::character varying,
    duration_in_months integer,
    starts_at timestamp without time zone DEFAULT now(),
    expires_at timestamp without time zone,
    active boolean DEFAULT true NOT NULL,
    stripe_coupon_id character varying,
    created_by character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.discount_codes OWNER TO neondb_owner;

--
-- Name: documents; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.documents (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    document_type text NOT NULL,
    content text NOT NULL,
    author text,
    language text,
    age text,
    condition text,
    significance text,
    location text,
    accessibility text,
    secrets text,
    history text,
    genre text,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    article_content text,
    notebook_id character varying,
    image_url text,
    image_caption text
);


ALTER TABLE public.documents OWNER TO neondb_owner;

--
-- Name: drinks; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.drinks (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    drink_type text NOT NULL,
    description text NOT NULL,
    ingredients text[],
    preparation text,
    alcohol_content text,
    effects text,
    origin text,
    cultural_significance text,
    taste text,
    appearance text,
    cost text,
    rarity text,
    genre text,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    article_content text,
    notebook_id character varying,
    image_url text,
    image_caption text
);


ALTER TABLE public.drinks OWNER TO neondb_owner;

--
-- Name: ethnicities; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.ethnicities (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    origin text,
    physical_traits text,
    cultural_traits text,
    traditions text[],
    language text,
    religion text,
    social_structure text,
    history text,
    geography text,
    "values" text[],
    customs text[],
    genre text,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    article_content text,
    notebook_id character varying,
    image_url text,
    image_caption text
);


ALTER TABLE public.ethnicities OWNER TO neondb_owner;

--
-- Name: events; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.events (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    event_type text NOT NULL,
    description text NOT NULL,
    date text,
    location text,
    participants text[],
    causes text,
    consequences text,
    significance text,
    duration text,
    scale text,
    documentation text,
    conflicting_accounts text,
    legacy text,
    genre text,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    notebook_id character varying
);


ALTER TABLE public.events OWNER TO neondb_owner;

--
-- Name: factions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.factions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    faction_type text NOT NULL,
    description text NOT NULL,
    goals text,
    ideology text,
    leadership text,
    members text,
    resources text,
    territory text,
    influence text,
    allies text[],
    enemies text[],
    methods text,
    history text,
    secrets text,
    genre text,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    notebook_id character varying
);


ALTER TABLE public.factions OWNER TO neondb_owner;

--
-- Name: family_tree_members; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.family_tree_members (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    tree_id character varying NOT NULL,
    character_id character varying,
    inline_name text,
    inline_date_of_birth text,
    inline_date_of_death text,
    inline_image_url text,
    position_x real,
    position_y real,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.family_tree_members OWNER TO neondb_owner;

--
-- Name: family_tree_relationships; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.family_tree_relationships (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    tree_id character varying NOT NULL,
    from_member_id character varying NOT NULL,
    to_member_id character varying NOT NULL,
    relationship_type text NOT NULL,
    custom_label text,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.family_tree_relationships OWNER TO neondb_owner;

--
-- Name: family_trees; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.family_trees (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    user_id character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    notebook_id character varying NOT NULL,
    layout_mode text DEFAULT 'manual'::text NOT NULL,
    zoom real DEFAULT 1,
    pan_x real DEFAULT 0,
    pan_y real DEFAULT 0,
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.family_trees OWNER TO neondb_owner;

--
-- Name: feedback; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.feedback (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    status text DEFAULT 'new'::text NOT NULL,
    user_email text NOT NULL,
    user_browser text,
    user_os text,
    current_page text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.feedback OWNER TO neondb_owner;

--
-- Name: folders; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.folders (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    color text,
    type text NOT NULL,
    parent_id character varying,
    user_id character varying NOT NULL,
    sort_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    guide_id character varying,
    project_id character varying
);


ALTER TABLE public.folders OWNER TO neondb_owner;

--
-- Name: foods; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.foods (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    food_type text NOT NULL,
    description text NOT NULL,
    ingredients text[],
    preparation text,
    origin text,
    cultural_significance text,
    nutritional_value text,
    taste text,
    texture text,
    cost text,
    rarity text,
    preservation text,
    genre text,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    article_content text,
    notebook_id character varying,
    image_url text,
    image_caption text
);


ALTER TABLE public.foods OWNER TO neondb_owner;

--
-- Name: guide_categories; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.guide_categories (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    parent_id character varying,
    "order" integer DEFAULT 0 NOT NULL,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.guide_categories OWNER TO neondb_owner;

--
-- Name: guide_references; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.guide_references (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    source_guide_id character varying NOT NULL,
    target_guide_id character varying NOT NULL,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.guide_references OWNER TO neondb_owner;

--
-- Name: guides; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.guides (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    content text NOT NULL,
    excerpt text NOT NULL,
    category text NOT NULL,
    read_time integer NOT NULL,
    difficulty text NOT NULL,
    rating real DEFAULT 0,
    author text NOT NULL,
    tags text[] NOT NULL,
    published boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    folder_id character varying,
    user_id character varying,
    category_id character varying
);


ALTER TABLE public.guides OWNER TO neondb_owner;

--
-- Name: import_jobs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.import_jobs (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    notebook_id character varying NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    processed_items integer DEFAULT 0,
    total_items integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    source text NOT NULL,
    progress integer DEFAULT 0,
    results jsonb,
    error_message text,
    completed_at timestamp without time zone
);


ALTER TABLE public.import_jobs OWNER TO neondb_owner;

--
-- Name: intrusion_attempts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.intrusion_attempts (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying,
    ip_address character varying NOT NULL,
    user_agent text,
    attack_type character varying NOT NULL,
    endpoint text,
    payload text,
    severity character varying NOT NULL,
    blocked boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.intrusion_attempts OWNER TO neondb_owner;

--
-- Name: ip_blocks; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.ip_blocks (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    ip_address character varying NOT NULL,
    reason text NOT NULL,
    severity character varying NOT NULL,
    blocked_at timestamp without time zone DEFAULT now(),
    expires_at timestamp without time zone,
    is_active boolean DEFAULT true,
    intrusion_attempt_id character varying,
    auto_blocked boolean DEFAULT true,
    blocked_by character varying
);


ALTER TABLE public.ip_blocks OWNER TO neondb_owner;

--
-- Name: items; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.items (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    item_type text NOT NULL,
    description text NOT NULL,
    rarity text,
    value text,
    weight text,
    properties text[],
    materials text[],
    history text,
    abilities text[],
    requirements text,
    crafting text,
    genre text,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    notebook_id character varying,
    article_content text,
    image_url text,
    image_caption text
);


ALTER TABLE public.items OWNER TO neondb_owner;

--
-- Name: languages; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.languages (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    family text,
    speakers text,
    regions text[],
    phonology text,
    grammar text,
    vocabulary text,
    writing_system text,
    common_phrases text[],
    cultural_context text,
    history text,
    variations text[],
    difficulty text,
    status text,
    genre text,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    notebook_id character varying
);


ALTER TABLE public.languages OWNER TO neondb_owner;

--
-- Name: laws; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.laws (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    law_type text NOT NULL,
    description text NOT NULL,
    jurisdiction text,
    authority text,
    penalties text[],
    exceptions text[],
    precedents text[],
    enforcement text,
    courts text[],
    appeals text,
    amendments text[],
    related_laws text[],
    controversy text,
    public_opinion text,
    historical_context text,
    effectiveness text,
    genre text,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    notebook_id character varying
);


ALTER TABLE public.laws OWNER TO neondb_owner;

--
-- Name: legends; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.legends (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    legend_type text NOT NULL,
    summary text NOT NULL,
    full_story text NOT NULL,
    historical_basis text,
    main_characters text[],
    location text,
    timeframe text,
    truth_elements text,
    exaggerations text,
    cultural_impact text,
    modern_adaptations text[],
    genre text,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    notebook_id character varying
);


ALTER TABLE public.legends OWNER TO neondb_owner;

--
-- Name: lifetime_subscriptions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.lifetime_subscriptions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    purchase_date timestamp without time zone DEFAULT now(),
    purchase_price_cents integer NOT NULL,
    tier_equivalent character varying NOT NULL,
    daily_generation_limit integer DEFAULT 50,
    is_active boolean DEFAULT true
);


ALTER TABLE public.lifetime_subscriptions OWNER TO neondb_owner;

--
-- Name: locations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.locations (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    location_type text NOT NULL,
    description text NOT NULL,
    geography text,
    climate text,
    population text,
    government text,
    economy text,
    culture text,
    history text,
    notable_features text[],
    landmarks text[],
    threats text[],
    resources text[],
    genre text,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    notebook_id character varying,
    article_content text,
    image_url text,
    image_caption text
);


ALTER TABLE public.locations OWNER TO neondb_owner;

--
-- Name: maps; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.maps (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    map_type text NOT NULL,
    description text NOT NULL,
    scale text,
    dimensions text,
    key_locations text[],
    terrain text[],
    climate text,
    political_boundaries text[],
    traderoutes text[],
    danger_zones text[],
    resources text[],
    landmarks text[],
    hidden_features text[],
    map_maker text,
    accuracy text,
    legends text[],
    genre text,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    notebook_id character varying
);


ALTER TABLE public.maps OWNER TO neondb_owner;

--
-- Name: materials; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.materials (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    material_type text NOT NULL,
    description text NOT NULL,
    properties text[],
    rarity text,
    value text,
    source text,
    processing text,
    uses text[],
    durability text,
    appearance text,
    weight text,
    genre text,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    notebook_id character varying
);


ALTER TABLE public.materials OWNER TO neondb_owner;

--
-- Name: military_units; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.military_units (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    unit_type text NOT NULL,
    description text NOT NULL,
    size text,
    composition text,
    equipment text[],
    training text,
    specializations text[],
    commander text,
    morale text,
    reputation text,
    history text,
    battle_record text,
    current_status text,
    genre text,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    notebook_id character varying
);


ALTER TABLE public.military_units OWNER TO neondb_owner;

--
-- Name: moods; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.moods (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    emotional_tone text NOT NULL,
    sensory_details text[] NOT NULL,
    color_associations text[] NOT NULL,
    weather_elements text[] NOT NULL,
    lighting_effects text[] NOT NULL,
    soundscape text[] NOT NULL,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    notebook_id character varying
);


ALTER TABLE public.moods OWNER TO neondb_owner;

--
-- Name: music; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.music (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    music_type text NOT NULL,
    description text NOT NULL,
    genre text,
    composer text,
    performers text[],
    instruments text[],
    vocals text,
    lyrics text,
    tempo text,
    mood text,
    cultural_origin text,
    occasion text,
    significance text,
    popularity text,
    musical_style text,
    length text,
    difficulty text,
    variations text[],
    user_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    notebook_id character varying
);


ALTER TABLE public.music OWNER TO neondb_owner;

--
-- Name: myths; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.myths (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    myth_type text NOT NULL,
    summary text NOT NULL,
    full_story text NOT NULL,
    characters text[],
    themes text[],
    moral_lesson text,
    cultural_origin text,
    symbolism text,
    variations text[],
    modern_relevance text,
    related_myths text[],
    genre text,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    notebook_id character varying
);


ALTER TABLE public.myths OWNER TO neondb_owner;

--
-- Name: names; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.names (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    meaning text,
    origin text,
    name_type text NOT NULL,
    culture text NOT NULL,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    notebook_id character varying
);


ALTER TABLE public.names OWNER TO neondb_owner;

--
-- Name: natural_laws; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.natural_laws (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    law_type text NOT NULL,
    description text NOT NULL,
    scope text,
    principles text,
    exceptions text[],
    discovery text,
    applications text[],
    implications text,
    related_laws text[],
    understanding text,
    controversies text,
    evidence text,
    genre text,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    notebook_id character varying
);


ALTER TABLE public.natural_laws OWNER TO neondb_owner;

--
-- Name: notebooks; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.notebooks (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    user_id character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    color text,
    icon text,
    is_default boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now(),
    image_url text
);


ALTER TABLE public.notebooks OWNER TO neondb_owner;

--
-- Name: notes; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.notes (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    content text DEFAULT ''::text NOT NULL,
    excerpt text,
    type text NOT NULL,
    folder_id character varying,
    guide_id character varying,
    sort_order integer DEFAULT 0,
    user_id character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    project_id character varying
);


ALTER TABLE public.notes OWNER TO neondb_owner;

--
-- Name: organizations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.organizations (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    organization_type text NOT NULL,
    purpose text NOT NULL,
    description text NOT NULL,
    structure text,
    leadership text,
    members text,
    headquarters text,
    influence text,
    resources text,
    goals text,
    history text,
    allies text[],
    enemies text[],
    genre text,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    notebook_id character varying,
    article_content text,
    image_url text,
    image_caption text
);


ALTER TABLE public.organizations OWNER TO neondb_owner;

--
-- Name: pinned_content; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.pinned_content (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    target_type text NOT NULL,
    target_id character varying NOT NULL,
    pin_order integer DEFAULT 0,
    category text,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    notebook_id character varying
);


ALTER TABLE public.pinned_content OWNER TO neondb_owner;

--
-- Name: plants; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.plants (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    scientific_name text NOT NULL,
    type text NOT NULL,
    description text NOT NULL,
    characteristics text[] NOT NULL,
    habitat text NOT NULL,
    care_instructions text NOT NULL,
    blooming_season text NOT NULL,
    hardiness_zone text NOT NULL,
    genre text,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    article_content text,
    notebook_id character varying,
    image_url text,
    image_caption text
);


ALTER TABLE public.plants OWNER TO neondb_owner;

--
-- Name: plots; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.plots (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    setup text NOT NULL,
    inciting_incident text NOT NULL,
    first_plot_point text NOT NULL,
    midpoint text NOT NULL,
    second_plot_point text NOT NULL,
    climax text NOT NULL,
    resolution text NOT NULL,
    theme text NOT NULL,
    conflict text NOT NULL,
    genre text,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    story_structure text,
    notebook_id character varying
);


ALTER TABLE public.plots OWNER TO neondb_owner;

--
-- Name: policies; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.policies (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    policy_type text NOT NULL,
    description text NOT NULL,
    scope text,
    authority text,
    objectives text[],
    implementation text,
    timeline text,
    resources text,
    stakeholders text[],
    benefits text[],
    drawbacks text[],
    public_reaction text,
    compliance text,
    monitoring text,
    amendments text[],
    related_policies text[],
    effectiveness text,
    genre text,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    notebook_id character varying
);


ALTER TABLE public.policies OWNER TO neondb_owner;

--
-- Name: potions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.potions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    potion_type text NOT NULL,
    description text NOT NULL,
    effects text[],
    duration text,
    potency text,
    ingredients text[],
    preparation text,
    brewing_time text,
    brewing_difficulty text,
    rarity text,
    cost text,
    side_effects text[],
    contraindications text[],
    antidotes text[],
    weaknesses text[],
    storage text,
    shelf_life text,
    appearance text,
    taste text,
    smell text,
    creator text,
    legality text,
    genre text,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    notebook_id character varying
);


ALTER TABLE public.potions OWNER TO neondb_owner;

--
-- Name: professions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.professions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    profession_type text,
    description text NOT NULL,
    skills_required text[],
    responsibilities text,
    work_environment text,
    training_required text,
    social_status text,
    average_income text,
    risk_level text,
    physical_demands text,
    mental_demands text,
    common_tools text[],
    related_professions text[],
    career_progression text,
    seasonal_work boolean DEFAULT false,
    apprenticeship text,
    guilds_organizations text[],
    historical_context text,
    cultural_significance text,
    genre text,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    notebook_id character varying
);


ALTER TABLE public.professions OWNER TO neondb_owner;

--
-- Name: project_links; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.project_links (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    source_id character varying NOT NULL,
    target_type text NOT NULL,
    target_id character varying NOT NULL,
    context_text text,
    link_text text,
    "position" integer,
    user_id character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.project_links OWNER TO neondb_owner;

--
-- Name: project_sections; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.project_sections (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    project_id character varying NOT NULL,
    parent_id character varying,
    title text NOT NULL,
    content text,
    type text NOT NULL,
    "position" integer NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.project_sections OWNER TO neondb_owner;

--
-- Name: projects; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.projects (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    content text DEFAULT ''::text NOT NULL,
    excerpt text,
    word_count integer DEFAULT 0,
    tags text[],
    status text DEFAULT 'draft'::text NOT NULL,
    user_id character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    search_vector tsvector,
    folder_id character varying,
    genre text,
    target_word_count integer,
    current_stage text,
    known_challenges text[] DEFAULT ARRAY[]::text[],
    recent_milestones text[] DEFAULT ARRAY[]::text[]
);


ALTER TABLE public.projects OWNER TO neondb_owner;

--
-- Name: prompts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.prompts (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    text text NOT NULL,
    genre text NOT NULL,
    difficulty text NOT NULL,
    type text NOT NULL,
    word_count text NOT NULL,
    tags text[] NOT NULL,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    notebook_id character varying
);


ALTER TABLE public.prompts OWNER TO neondb_owner;

--
-- Name: ranks; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.ranks (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    rank_type text,
    description text NOT NULL,
    hierarchy integer,
    authority text,
    responsibilities text[],
    privileges text[],
    insignia text,
    requirements text,
    organization_id text,
    superior_ranks text[],
    subordinate_ranks text[],
    title_of_address text,
    historical_origin text,
    genre text,
    notebook_id character varying,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.ranks OWNER TO neondb_owner;

--
-- Name: religions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.religions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    beliefs text[],
    practices text[],
    deities text[],
    hierarchy text,
    followers text,
    history text,
    scriptures text,
    ceremonies text[],
    symbols text[],
    morality text,
    afterlife text,
    influence text,
    genre text,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    notebook_id character varying
);


ALTER TABLE public.religions OWNER TO neondb_owner;

--
-- Name: resources; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.resources (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    resource_type text NOT NULL,
    description text NOT NULL,
    abundance text,
    location text,
    extraction_method text,
    uses text[],
    value text,
    rarity text,
    renewability text,
    trade_commodity text,
    controlled_by text,
    conflicts text,
    genre text,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    notebook_id character varying
);


ALTER TABLE public.resources OWNER TO neondb_owner;

--
-- Name: rituals; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.rituals (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    ritual_type text NOT NULL,
    description text NOT NULL,
    purpose text,
    participants text,
    requirements text[],
    steps text[],
    duration text,
    location text,
    timing text,
    components text[],
    effects text,
    risks text,
    variations text[],
    genre text,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    notebook_id character varying
);


ALTER TABLE public.rituals OWNER TO neondb_owner;

--
-- Name: saved_items; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.saved_items (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    item_type text NOT NULL,
    item_id character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    item_data jsonb,
    notebook_id character varying NOT NULL
);


ALTER TABLE public.saved_items OWNER TO neondb_owner;

--
-- Name: security_alerts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.security_alerts (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    alert_type character varying NOT NULL,
    severity character varying NOT NULL,
    message text NOT NULL,
    details jsonb,
    acknowledged boolean DEFAULT false,
    acknowledged_by character varying,
    acknowledged_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.security_alerts OWNER TO neondb_owner;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.sessions (
    sid character varying NOT NULL,
    sess jsonb NOT NULL,
    expire timestamp without time zone NOT NULL
);


ALTER TABLE public.sessions OWNER TO neondb_owner;

--
-- Name: settings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.settings (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    location text NOT NULL,
    time_period text NOT NULL,
    population text NOT NULL,
    climate text NOT NULL,
    description text NOT NULL,
    atmosphere text NOT NULL,
    cultural_elements text[] NOT NULL,
    notable_features text[] NOT NULL,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    genre text,
    setting_type text,
    article_content text,
    notebook_id character varying,
    image_url text,
    image_caption text
);


ALTER TABLE public.settings OWNER TO neondb_owner;

--
-- Name: settlements; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.settlements (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    settlement_type text NOT NULL,
    description text NOT NULL,
    population text,
    government text,
    economy text,
    defenses text,
    culture text,
    history text,
    geography text,
    climate text,
    resources text[],
    threats text[],
    landmarks text[],
    districts text[],
    genre text,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    notebook_id character varying
);


ALTER TABLE public.settlements OWNER TO neondb_owner;

--
-- Name: shares; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.shares (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    resource_type text NOT NULL,
    resource_id character varying NOT NULL,
    user_id character varying NOT NULL,
    owner_id character varying NOT NULL,
    permission text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.shares OWNER TO neondb_owner;

--
-- Name: societies; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.societies (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    society_type text NOT NULL,
    description text NOT NULL,
    structure text,
    leadership text,
    laws text,
    "values" text[],
    customs text[],
    economy text,
    technology text,
    education text,
    military text,
    religion text,
    arts text,
    history text,
    genre text,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    notebook_id character varying
);


ALTER TABLE public.societies OWNER TO neondb_owner;

--
-- Name: species; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.species (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    classification text,
    physical_description text NOT NULL,
    habitat text,
    behavior text,
    diet text,
    lifespan text,
    intelligence text,
    social_structure text,
    abilities text[],
    weaknesses text[],
    cultural_traits text,
    reproduction text,
    genre text,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    notebook_id character varying,
    article_content text,
    image_url text,
    image_caption text
);


ALTER TABLE public.species OWNER TO neondb_owner;

--
-- Name: spells; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.spells (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    school text,
    level text,
    description text NOT NULL,
    components text[],
    casting_time text,
    range text,
    duration text,
    effect text,
    limitations text,
    rarity text,
    origin text,
    variations text[],
    risks text,
    genre text,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    notebook_id character varying
);


ALTER TABLE public.spells OWNER TO neondb_owner;

--
-- Name: team_activity; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.team_activity (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    team_subscription_id character varying NOT NULL,
    user_id character varying NOT NULL,
    activity_type character varying NOT NULL,
    resource_type character varying,
    resource_id character varying,
    resource_name text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.team_activity OWNER TO neondb_owner;

--
-- Name: team_invitations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.team_invitations (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    team_subscription_id character varying NOT NULL,
    email character varying NOT NULL,
    role character varying NOT NULL,
    can_edit boolean DEFAULT true,
    can_comment boolean DEFAULT true,
    can_invite boolean DEFAULT false,
    invited_by character varying NOT NULL,
    token character varying NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    status character varying DEFAULT 'pending'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.team_invitations OWNER TO neondb_owner;

--
-- Name: team_memberships; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.team_memberships (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    team_subscription_id character varying NOT NULL,
    user_id character varying NOT NULL,
    role character varying NOT NULL,
    can_edit boolean DEFAULT true,
    can_comment boolean DEFAULT true,
    can_invite boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.team_memberships OWNER TO neondb_owner;

--
-- Name: technologies; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.technologies (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    technology_type text NOT NULL,
    description text NOT NULL,
    function text,
    principles text,
    requirements text[],
    limitations text[],
    applications text[],
    development text,
    inventors text,
    rarity text,
    risks text,
    evolution text,
    genre text,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    notebook_id character varying
);


ALTER TABLE public.technologies OWNER TO neondb_owner;

--
-- Name: themes; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.themes (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    core_message text NOT NULL,
    symbolic_elements text[] NOT NULL,
    questions text[] NOT NULL,
    conflicts text[] NOT NULL,
    examples text[] NOT NULL,
    genre text,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    article_content text,
    notebook_id character varying,
    image_url text,
    image_caption text
);


ALTER TABLE public.themes OWNER TO neondb_owner;

--
-- Name: timeline_events; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.timeline_events (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    timeline_id character varying NOT NULL,
    title text NOT NULL,
    description text,
    event_type text,
    start_date text NOT NULL,
    end_date text,
    importance text DEFAULT 'moderate'::text,
    category text,
    color text,
    icon text,
    linked_content_id character varying,
    linked_content_type text,
    position_y real,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    position_x real,
    character_ids text[]
);


ALTER TABLE public.timeline_events OWNER TO neondb_owner;

--
-- Name: timeline_relationships; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.timeline_relationships (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    timeline_id character varying NOT NULL,
    from_event_id character varying NOT NULL,
    to_event_id character varying NOT NULL,
    relationship_type text NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.timeline_relationships OWNER TO neondb_owner;

--
-- Name: timelines; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.timelines (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    timeline_type text NOT NULL,
    time_scale text NOT NULL,
    start_date text,
    end_date text,
    scope text,
    genre text,
    user_id character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    notebook_id character varying NOT NULL,
    view_mode text DEFAULT 'list'::text,
    zoom real DEFAULT 1,
    pan_x real DEFAULT 0,
    pan_y real DEFAULT 0,
    list_view_mode text DEFAULT 'compact'::text
);


ALTER TABLE public.timelines OWNER TO neondb_owner;

--
-- Name: traditions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.traditions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    tradition_type text NOT NULL,
    description text NOT NULL,
    origin text,
    purpose text,
    participants text,
    procedure text,
    timing text,
    location text,
    symbolism text,
    significance text,
    modern_practice text,
    variations text[],
    related_traditions text[],
    genre text,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    notebook_id character varying
);


ALTER TABLE public.traditions OWNER TO neondb_owner;

--
-- Name: transportation; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.transportation (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    transport_type text NOT NULL,
    description text NOT NULL,
    capacity text,
    speed text,
    range text,
    requirements text,
    construction text,
    operation text,
    cost text,
    rarity text,
    advantages text[],
    disadvantages text[],
    cultural_significance text,
    genre text,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    notebook_id character varying
);


ALTER TABLE public.transportation OWNER TO neondb_owner;

--
-- Name: user_preferences; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_preferences (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    experience_level text,
    preferred_genres text[],
    writing_goals text[],
    feedback_style text,
    target_word_count integer,
    writing_schedule text,
    preferred_tone text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    response_format text,
    detail_level text,
    examples_preference text,
    onboarding_completed boolean DEFAULT false,
    onboarding_step integer DEFAULT 0,
    beta_banner_dismissed boolean DEFAULT false
);


ALTER TABLE public.user_preferences OWNER TO neondb_owner;

--
-- Name: user_subscriptions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_subscriptions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    tier character varying NOT NULL,
    status character varying NOT NULL,
    stripe_customer_id character varying,
    stripe_subscription_id character varying,
    stripe_price_id character varying,
    current_period_start timestamp without time zone,
    current_period_end timestamp without time zone,
    cancel_at_period_end boolean DEFAULT false,
    trial_start timestamp without time zone,
    trial_end timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    paused_at timestamp without time zone,
    resumes_at timestamp without time zone,
    pause_reason text,
    grace_period_start timestamp without time zone,
    grace_period_end timestamp without time zone
);


ALTER TABLE public.user_subscriptions OWNER TO neondb_owner;

--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    email character varying,
    first_name character varying,
    last_name character varying,
    profile_image_url character varying,
    updated_at timestamp without time zone DEFAULT now(),
    is_admin boolean DEFAULT false,
    subscription_tier character varying DEFAULT 'free'::character varying,
    grandfathered_tier character varying,
    onboarding_completed boolean DEFAULT false,
    trial_used boolean DEFAULT false,
    mfa_enabled boolean DEFAULT false,
    mfa_secret text,
    backup_codes text[]
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: weapons; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.weapons (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    weapon_type text NOT NULL,
    description text NOT NULL,
    damage text,
    range text,
    weight text,
    materials text[],
    craftsmanship text,
    enchantments text[],
    history text,
    rarity text,
    value text,
    requirements text,
    maintenance text,
    genre text,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    notebook_id character varying,
    article_content text,
    image_url text,
    image_caption text
);


ALTER TABLE public.weapons OWNER TO neondb_owner;

--
-- Data for Name: accessories; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.accessories (id, name, accessory_type, description, materials, value, rarity, enchantments, cultural_significance, history, appearance, functionality, genre, user_id, created_at, notebook_id) FROM stdin;
\.


--
-- Data for Name: ai_usage_daily_summary; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.ai_usage_daily_summary (id, user_id, date, total_operations, total_input_tokens, total_output_tokens, total_cost_cents, operations_breakdown, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: ai_usage_logs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.ai_usage_logs (id, user_id, operation_type, model, input_tokens, output_tokens, cached_tokens, estimated_cost_cents, project_id, notebook_id, created_at) FROM stdin;
\.


--
-- Data for Name: animals; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.animals (id, name, animal_type, description, habitat, diet, behavior, physical_traits, size, domestication, intelligence, abilities, lifecycle, cultural_role, threats, genre, user_id, created_at, notebook_id) FROM stdin;
\.


--
-- Data for Name: api_key_rotation_audit; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.api_key_rotation_audit (id, key_rotation_id, action, performed_by, notes, "timestamp") FROM stdin;
1b9ddbd6-1114-4183-a56e-c7d6a9e768f1	62b08361-6cab-462d-aef7-13bd7ac47aaa	created	\N	Registered ANTHROPIC_API_KEY for rotation tracking	2025-10-26 01:30:30.122731
f53e05c4-56ac-4f68-af9a-b83e71ad2398	da27fcc5-20f8-4fce-9191-6a16b7e0b29e	created	\N	Registered MFA_ENCRYPTION_KEY for rotation tracking	2025-10-26 01:30:30.277391
86006aa8-9edc-4d79-b455-dc681a7c1ea5	1e9b64d3-6966-433f-a7e8-97a03a968c05	created	\N	Registered SESSION_SECRET for rotation tracking	2025-10-26 01:30:30.418724
\.


--
-- Data for Name: api_key_rotations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.api_key_rotations (id, key_name, key_type, description, rotation_interval_days, last_rotated_at, next_rotation_due, rotation_status, notification_sent, last_notification_sent_at, rotation_count, last_rotated_by, is_active, created_at, updated_at) FROM stdin;
62b08361-6cab-462d-aef7-13bd7ac47aaa	ANTHROPIC_API_KEY	external_api	Anthropic Claude API key for AI writing assistance	90	2025-10-26 01:30:27.053	2026-01-24 01:30:27.053	current	f	\N	0	\N	t	2025-10-26 01:30:29.917379	2025-10-26 01:30:29.917379
da27fcc5-20f8-4fce-9191-6a16b7e0b29e	MFA_ENCRYPTION_KEY	encryption	Encryption key for MFA secrets storage	90	2025-10-26 01:30:30.152	2026-01-24 01:30:30.152	current	f	\N	0	\N	t	2025-10-26 01:30:30.206374	2025-10-26 01:30:30.206374
1e9b64d3-6966-433f-a7e8-97a03a968c05	SESSION_SECRET	signing	Secret for session signing and encryption	90	2025-10-26 01:30:30.293	2026-01-24 01:30:30.293	current	f	\N	0	\N	t	2025-10-26 01:30:30.347398	2025-10-26 01:30:30.347398
\.


--
-- Data for Name: api_key_usage_logs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.api_key_usage_logs (id, api_key_id, user_id, endpoint, method, status_code, response_time, ip_address, user_agent, error_message, created_at) FROM stdin;
\.


--
-- Data for Name: api_keys; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.api_keys (id, user_id, name, key_hash, prefix, scope, allowed_endpoints, monthly_rate_limit, current_month_usage, last_used_at, usage_reset_date, is_active, expires_at, revoked_at, revoked_reason, last_rotated_at, ip_whitelist, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: armor; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.armor (id, name, armor_type, description, protection, weight, materials, coverage, mobility, enchantments, craftsmanship, history, rarity, value, maintenance, genre, user_id, created_at, notebook_id) FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.audit_logs (id, team_subscription_id, user_id, action, resource_type, resource_id, resource_name, changes_before, changes_after, ip_address, user_agent, created_at) FROM stdin;
\.


--
-- Data for Name: banned_phrases; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.banned_phrases (id, phrase, category, replacement, is_active, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: billing_alerts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.billing_alerts (id, user_id, type, severity, title, message, stripe_invoice_id, stripe_subscription_id, status, dismissed_at, resolved_at, metadata, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: buildings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.buildings (id, name, building_type, description, architecture, materials, purpose, capacity, defenses, history, current_condition, location, owner, significance, secrets, genre, user_id, created_at, notebook_id) FROM stdin;
\.


--
-- Data for Name: canvases; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.canvases (id, name, description, data, project_id, tags, is_template, user_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: ceremonies; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.ceremonies (id, name, ceremony_type, description, purpose, participants, officiant, location, duration, season, frequency, traditions, symbolism, required_items, dress, music, food, gifts, significance, restrictions, variations, genre, user_id, created_at, notebook_id) FROM stdin;
\.


--
-- Data for Name: characters; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.characters (id, age, occupation, personality, backstory, motivation, flaw, strength, genre, user_id, created_at, gender, height, build, hair_color, eye_color, skin_tone, facial_features, identifying_marks, physical_description, sex, gender_identity, physical_presentation, hair_texture, hair_style, height_detail, weight, species, ethnicity, pronouns, current_location, conditions, family, current_residence, religious_belief, affiliated_organizations, given_name, family_name, middle_name, maiden_name, nickname, honorific_title, suffix, prefix, date_of_birth, place_of_birth, date_of_death, place_of_death, upbringing, gender_understanding, sexual_orientation, education, profession, work_history, accomplishments, negative_events, mental_health, intellectual_traits, values_ethics_morals, frowned_upon_views, languages, language_fluency_accent, physical_condition, distinctive_body_features, facial_details, striking_features, marks_piercings_tattoos, distinct_physical_features, supernatural_powers, special_abilities, mutations, typical_attire, accessories, key_equipment, specialized_items, main_skills, strengths, positive_aspects, proficiencies, lacking_skills, lacking_knowledge, character_flaws, addictions, vices, defects, secret_beliefs, likes, dislikes, world_influence, legacy, remembered_by, behavioral_traits, particularities, hygiene_value, famous_quotes, catchphrases, overseeing_domain, leadership_group, position_duration, key_relationships, allies, enemies, familial_ties, religious_views, spiritual_practices, charisma, confidence, ego, extroversion, etiquette, mannerisms, habitual_gestures, speaking_style, behaving_style, hobbies, interests, activities, pets, speech_particularities, tone_of_voice, voice_pitch, accent, dialect, speech_impediments, common_phrases, compliments, insults, greetings, farewells, swearing, metaphors, wealth_class, dependencies, debts, funds, disposable_income, assets, investments, notebook_id, article_content, image_url, image_caption, description, import_source, import_external_id) FROM stdin;
\.


--
-- Data for Name: chat_messages; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.chat_messages (id, user_id, guide_id, type, content, metadata, created_at, project_id, thread_id) FROM stdin;
\.


--
-- Data for Name: clothing; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.clothing (id, name, clothing_type, description, materials, style, colors, social_class, cultural_context, climate, occasion, cost, durability, genre, user_id, created_at, notebook_id) FROM stdin;
\.


--
-- Data for Name: conditions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.conditions (id, name, condition_type, description, symptoms, causes, transmission, duration, severity, effects, treatment, cure, prevention, complications, mortality, prevalence, affected_species, cultural_impact, historical_outbreaks, genre, notebook_id, user_id, created_at) FROM stdin;
\.


--
-- Data for Name: conflicts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.conflicts (id, title, type, description, stakes, obstacles, potential_resolutions, emotional_impact, genre, user_id, created_at, article_content, notebook_id, image_url, image_caption) FROM stdin;
\.


--
-- Data for Name: conversation_summaries; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.conversation_summaries (id, user_id, project_id, guide_id, key_challenges, breakthroughs, recurring_questions, last_discussed_topics, writer_progress, last_discussed, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: conversation_threads; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.conversation_threads (id, user_id, project_id, guide_id, title, summary, tags, parent_thread_id, is_active, message_count, last_activity_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: creatures; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.creatures (id, name, creature_type, habitat, physical_description, abilities, behavior, cultural_significance, genre, user_id, created_at, article_content, notebook_id, image_url, image_caption) FROM stdin;
\.


--
-- Data for Name: cultures; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.cultures (id, name, description, "values", beliefs, traditions, social_norms, language, arts, technology, governance, economy, education, family, ceremonies, genre, user_id, created_at, notebook_id, article_content, image_url, image_caption) FROM stdin;
\.


--
-- Data for Name: dances; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.dances (id, name, dance_type, description, origin, movements, formations, participants, music, costumes, props, occasion, difficulty, duration, symbolism, cultural_significance, restrictions, variations, teaching_methods, genre, user_id, created_at, notebook_id) FROM stdin;
\.


--
-- Data for Name: descriptions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.descriptions (id, title, content, description_type, genre, tags, user_id, created_at, notebook_id) FROM stdin;
\.


--
-- Data for Name: discount_code_usage; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.discount_code_usage (id, discount_code_id, user_id, subscription_id, discount_amount, used_at) FROM stdin;
\.


--
-- Data for Name: discount_codes; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.discount_codes (id, code, name, type, value, applicable_tiers, max_uses, current_uses, max_uses_per_user, duration, duration_in_months, starts_at, expires_at, active, stripe_coupon_id, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.documents (id, title, document_type, content, author, language, age, condition, significance, location, accessibility, secrets, history, genre, user_id, created_at, article_content, notebook_id, image_url, image_caption) FROM stdin;
\.


--
-- Data for Name: drinks; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.drinks (id, name, drink_type, description, ingredients, preparation, alcohol_content, effects, origin, cultural_significance, taste, appearance, cost, rarity, genre, user_id, created_at, article_content, notebook_id, image_url, image_caption) FROM stdin;
\.


--
-- Data for Name: ethnicities; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.ethnicities (id, name, origin, physical_traits, cultural_traits, traditions, language, religion, social_structure, history, geography, "values", customs, genre, user_id, created_at, article_content, notebook_id, image_url, image_caption) FROM stdin;
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.events (id, name, event_type, description, date, location, participants, causes, consequences, significance, duration, scale, documentation, conflicting_accounts, legacy, genre, user_id, created_at, notebook_id) FROM stdin;
\.


--
-- Data for Name: factions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.factions (id, name, faction_type, description, goals, ideology, leadership, members, resources, territory, influence, allies, enemies, methods, history, secrets, genre, user_id, created_at, notebook_id) FROM stdin;
\.


--
-- Data for Name: family_tree_members; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.family_tree_members (id, tree_id, character_id, inline_name, inline_date_of_birth, inline_date_of_death, inline_image_url, position_x, position_y, created_at) FROM stdin;
\.


--
-- Data for Name: family_tree_relationships; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.family_tree_relationships (id, tree_id, from_member_id, to_member_id, relationship_type, custom_label, metadata, created_at) FROM stdin;
\.


--
-- Data for Name: family_trees; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.family_trees (id, name, description, user_id, created_at, notebook_id, layout_mode, zoom, pan_x, pan_y, updated_at) FROM stdin;
\.


--
-- Data for Name: feedback; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.feedback (id, user_id, type, title, description, status, user_email, user_browser, user_os, current_page, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: folders; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.folders (id, name, description, color, type, parent_id, user_id, sort_order, created_at, updated_at, guide_id, project_id) FROM stdin;
\.


--
-- Data for Name: foods; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.foods (id, name, food_type, description, ingredients, preparation, origin, cultural_significance, nutritional_value, taste, texture, cost, rarity, preservation, genre, user_id, created_at, article_content, notebook_id, image_url, image_caption) FROM stdin;
\.


--
-- Data for Name: guide_categories; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.guide_categories (id, name, parent_id, "order", user_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: guide_references; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.guide_references (id, source_guide_id, target_guide_id, user_id, created_at) FROM stdin;
\.


--
-- Data for Name: guides; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.guides (id, title, description, content, excerpt, category, read_time, difficulty, rating, author, tags, published, created_at, updated_at, folder_id, user_id, category_id) FROM stdin;
\.


--
-- Data for Name: import_jobs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.import_jobs (id, user_id, notebook_id, status, processed_items, total_items, created_at, source, progress, results, error_message, completed_at) FROM stdin;
\.


--
-- Data for Name: intrusion_attempts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.intrusion_attempts (id, user_id, ip_address, user_agent, attack_type, endpoint, payload, severity, blocked, created_at) FROM stdin;
\.


--
-- Data for Name: ip_blocks; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.ip_blocks (id, ip_address, reason, severity, blocked_at, expires_at, is_active, intrusion_attempt_id, auto_blocked, blocked_by) FROM stdin;
\.


--
-- Data for Name: items; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.items (id, name, item_type, description, rarity, value, weight, properties, materials, history, abilities, requirements, crafting, genre, user_id, created_at, notebook_id, article_content, image_url, image_caption) FROM stdin;
\.


--
-- Data for Name: languages; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.languages (id, name, family, speakers, regions, phonology, grammar, vocabulary, writing_system, common_phrases, cultural_context, history, variations, difficulty, status, genre, user_id, created_at, notebook_id) FROM stdin;
\.


--
-- Data for Name: laws; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.laws (id, name, law_type, description, jurisdiction, authority, penalties, exceptions, precedents, enforcement, courts, appeals, amendments, related_laws, controversy, public_opinion, historical_context, effectiveness, genre, user_id, created_at, notebook_id) FROM stdin;
\.


--
-- Data for Name: legends; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.legends (id, title, legend_type, summary, full_story, historical_basis, main_characters, location, timeframe, truth_elements, exaggerations, cultural_impact, modern_adaptations, genre, user_id, created_at, notebook_id) FROM stdin;
\.


--
-- Data for Name: lifetime_subscriptions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.lifetime_subscriptions (id, user_id, purchase_date, purchase_price_cents, tier_equivalent, daily_generation_limit, is_active) FROM stdin;
\.


--
-- Data for Name: locations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.locations (id, name, location_type, description, geography, climate, population, government, economy, culture, history, notable_features, landmarks, threats, resources, genre, user_id, created_at, notebook_id, article_content, image_url, image_caption) FROM stdin;
\.


--
-- Data for Name: maps; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.maps (id, name, map_type, description, scale, dimensions, key_locations, terrain, climate, political_boundaries, traderoutes, danger_zones, resources, landmarks, hidden_features, map_maker, accuracy, legends, genre, user_id, created_at, notebook_id) FROM stdin;
\.


--
-- Data for Name: materials; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.materials (id, name, material_type, description, properties, rarity, value, source, processing, uses, durability, appearance, weight, genre, user_id, created_at, notebook_id) FROM stdin;
\.


--
-- Data for Name: military_units; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.military_units (id, name, unit_type, description, size, composition, equipment, training, specializations, commander, morale, reputation, history, battle_record, current_status, genre, user_id, created_at, notebook_id) FROM stdin;
\.


--
-- Data for Name: moods; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.moods (id, name, description, emotional_tone, sensory_details, color_associations, weather_elements, lighting_effects, soundscape, user_id, created_at, notebook_id) FROM stdin;
\.


--
-- Data for Name: music; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.music (id, name, music_type, description, genre, composer, performers, instruments, vocals, lyrics, tempo, mood, cultural_origin, occasion, significance, popularity, musical_style, length, difficulty, variations, user_id, created_at, notebook_id) FROM stdin;
\.


--
-- Data for Name: myths; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.myths (id, title, myth_type, summary, full_story, characters, themes, moral_lesson, cultural_origin, symbolism, variations, modern_relevance, related_myths, genre, user_id, created_at, notebook_id) FROM stdin;
\.


--
-- Data for Name: names; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.names (id, name, meaning, origin, name_type, culture, user_id, created_at, notebook_id) FROM stdin;
\.


--
-- Data for Name: natural_laws; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.natural_laws (id, name, law_type, description, scope, principles, exceptions, discovery, applications, implications, related_laws, understanding, controversies, evidence, genre, user_id, created_at, notebook_id) FROM stdin;
\.


--
-- Data for Name: notebooks; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.notebooks (id, name, description, user_id, created_at, color, icon, is_default, updated_at, image_url) FROM stdin;
\.


--
-- Data for Name: notes; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.notes (id, title, content, excerpt, type, folder_id, guide_id, sort_order, user_id, created_at, updated_at, project_id) FROM stdin;
\.


--
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.organizations (id, name, organization_type, purpose, description, structure, leadership, members, headquarters, influence, resources, goals, history, allies, enemies, genre, user_id, created_at, notebook_id, article_content, image_url, image_caption) FROM stdin;
\.


--
-- Data for Name: pinned_content; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.pinned_content (id, user_id, target_type, target_id, pin_order, category, notes, created_at, notebook_id) FROM stdin;
\.


--
-- Data for Name: plants; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.plants (id, name, scientific_name, type, description, characteristics, habitat, care_instructions, blooming_season, hardiness_zone, genre, user_id, created_at, article_content, notebook_id, image_url, image_caption) FROM stdin;
\.


--
-- Data for Name: plots; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.plots (id, setup, inciting_incident, first_plot_point, midpoint, second_plot_point, climax, resolution, theme, conflict, genre, user_id, created_at, story_structure, notebook_id) FROM stdin;
\.


--
-- Data for Name: policies; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.policies (id, name, policy_type, description, scope, authority, objectives, implementation, timeline, resources, stakeholders, benefits, drawbacks, public_reaction, compliance, monitoring, amendments, related_policies, effectiveness, genre, user_id, created_at, notebook_id) FROM stdin;
\.


--
-- Data for Name: potions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.potions (id, name, potion_type, description, effects, duration, potency, ingredients, preparation, brewing_time, brewing_difficulty, rarity, cost, side_effects, contraindications, antidotes, weaknesses, storage, shelf_life, appearance, taste, smell, creator, legality, genre, user_id, created_at, notebook_id) FROM stdin;
\.


--
-- Data for Name: professions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.professions (id, name, profession_type, description, skills_required, responsibilities, work_environment, training_required, social_status, average_income, risk_level, physical_demands, mental_demands, common_tools, related_professions, career_progression, seasonal_work, apprenticeship, guilds_organizations, historical_context, cultural_significance, genre, user_id, created_at, notebook_id) FROM stdin;
\.


--
-- Data for Name: project_links; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.project_links (id, source_id, target_type, target_id, context_text, link_text, "position", user_id, created_at) FROM stdin;
\.


--
-- Data for Name: project_sections; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.project_sections (id, project_id, parent_id, title, content, type, "position", created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.projects (id, title, content, excerpt, word_count, tags, status, user_id, created_at, updated_at, search_vector, folder_id, genre, target_word_count, current_stage, known_challenges, recent_milestones) FROM stdin;
\.


--
-- Data for Name: prompts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.prompts (id, text, genre, difficulty, type, word_count, tags, user_id, created_at, notebook_id) FROM stdin;
\.


--
-- Data for Name: ranks; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.ranks (id, name, rank_type, description, hierarchy, authority, responsibilities, privileges, insignia, requirements, organization_id, superior_ranks, subordinate_ranks, title_of_address, historical_origin, genre, notebook_id, user_id, created_at) FROM stdin;
\.


--
-- Data for Name: religions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.religions (id, name, description, beliefs, practices, deities, hierarchy, followers, history, scriptures, ceremonies, symbols, morality, afterlife, influence, genre, user_id, created_at, notebook_id) FROM stdin;
\.


--
-- Data for Name: resources; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.resources (id, name, resource_type, description, abundance, location, extraction_method, uses, value, rarity, renewability, trade_commodity, controlled_by, conflicts, genre, user_id, created_at, notebook_id) FROM stdin;
\.


--
-- Data for Name: rituals; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.rituals (id, name, ritual_type, description, purpose, participants, requirements, steps, duration, location, timing, components, effects, risks, variations, genre, user_id, created_at, notebook_id) FROM stdin;
\.


--
-- Data for Name: saved_items; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.saved_items (id, user_id, item_type, item_id, created_at, item_data, notebook_id) FROM stdin;
\.


--
-- Data for Name: security_alerts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.security_alerts (id, alert_type, severity, message, details, acknowledged, acknowledged_by, acknowledged_at, created_at) FROM stdin;
0fe32197-26c3-43b9-9855-aa482b363ccc	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T14:11:18.762Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 14:11:18.781926
d72dc9fa-d847-4797-9f50-1cc2f813a1f5	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T14:18:15.193Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 14:18:15.272834
0bd5c795-94ea-4ddf-a72b-be90b1a4b579	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T14:18:46.147Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 14:18:46.165217
692cf850-4b8e-41e4-95fa-0af5077b0c53	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T14:23:01.690Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 14:23:01.707919
51cec8bd-3faf-4bbf-8b99-b626ad09306b	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T14:23:10.246Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 14:23:10.264763
049681d2-3f83-42e1-b8cd-c5ff2569e76e	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T14:33:29.939Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 14:33:30.039004
6820975b-50a6-4035-b24d-6c6caca51a1d	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T14:33:53.647Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 14:33:53.736681
c9b0907b-2c1b-40de-9e80-9c8e06156033	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T14:36:36.556Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 14:36:36.575262
22438cb6-d9d6-4fcd-b221-942ae4c1deb8	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T14:37:39.960Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 14:37:39.977804
f8e8ed90-73d7-4ff8-abda-4e5e9bd6d25c	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T14:40:16.385Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 14:40:16.404153
640a7b95-b08b-4b7d-9a7c-bc334e6d0950	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T14:43:13.112Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 14:43:13.131111
256ad7c4-9a33-41e9-a015-95e3b83d8c3e	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T14:44:42.378Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 14:44:44.473777
cdd6e41d-e41e-4533-a6c2-6a1d3855cbcd	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T14:46:59.562Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 14:47:01.652535
503e4bcc-a787-4e5d-b8a6-ccffaaf572a0	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T14:50:07.315Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 14:50:07.333145
bc2b64b3-410d-4272-97e6-16b16edb5932	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T14:53:08.422Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 14:53:10.517868
7f86fce8-0e37-4ea4-b5c5-48a88640bd02	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T14:54:24.825Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 14:54:24.84278
7240eb44-133a-4b6f-aabc-56ab64be1fa5	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T14:56:49.372Z", "userAgent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 14:56:51.470219
eb7f3b98-e6ea-4937-93ac-bad732cfd429	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T14:58:24.345Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 14:58:24.363717
7d007ccc-a9d4-48d9-a7b1-69956af9ba90	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T15:14:18.658Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 15:14:20.753106
be018453-2c6f-4d97-b158-c335b80af5ee	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T15:14:32.965Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 15:14:33.055941
2a71e3c2-734f-41c4-ac79-627e3394fb22	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T18:00:21.682Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 18:00:21.701571
3ccd8251-2808-4b44-88e6-94e4b211342e	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T18:00:22.356Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 18:00:22.375727
a26773dd-54a7-4a7b-b9b6-ce52def1ea0a	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T18:00:22.359Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 18:00:22.378354
275c514d-5e17-424a-830a-a07bfdbe8452	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T18:00:22.363Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 18:00:22.381955
c148f875-646c-4760-8e08-f0b8afb32456	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T18:00:22.367Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 18:00:22.386521
fa199f80-d6b0-4f11-be1b-6148875faa27	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T18:05:20.499Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 18:05:20.517658
b071d9d1-2393-49ce-bb6b-481e1bab8c67	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T18:05:20.504Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 18:05:20.534502
a7304d06-1492-4bc7-b968-b6392216d442	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T18:05:20.586Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 18:05:20.604962
b6f49fec-b93f-49c2-ba34-a06aed3ae09e	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T18:05:20.531Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 18:05:20.616547
d68fe7db-986c-469b-a40e-74262ec4eddb	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T18:05:21.501Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 18:05:21.519722
65029e3a-794b-4a9d-ab70-63747317857c	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T18:14:59.066Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 18:14:59.087378
d56e6434-ca51-4ca0-9a22-cd62a7d734a9	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T18:14:59.077Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 18:14:59.096902
6fe83445-6893-4741-be80-5f75b24ab5fb	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T18:14:59.072Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 18:14:59.090946
2628262f-8a29-41ec-88ca-9d37b8ac1b9b	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T18:14:59.075Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 18:14:59.10215
a79a9d64-c67b-4c01-b349-017750409bc1	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T18:14:59.896Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 18:14:59.915888
be5646c1-61c2-420d-8799-a58e53b2a8c1	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T18:20:19.948Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 18:20:19.966504
979040dd-fdfd-4e05-ae96-82ad2fb564b8	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T18:20:19.973Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 18:20:20.055877
349d7cba-2231-453f-8c79-18072dbc739c	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T18:20:20.041Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 18:20:20.059565
67697052-4797-4b0e-8ccf-d00d5c7712ff	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T18:20:20.246Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 18:20:20.264367
e9536d7e-f156-43bd-aeb0-6f0fce5f6516	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T18:20:20.784Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 18:20:20.802765
c4937626-9197-4860-909c-d65224d83f9f	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T18:24:46.604Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 18:24:46.622474
79e5bc58-cf5f-4ace-824c-b5821931739f	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T18:24:46.611Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 18:24:46.629332
c6ffe560-e4e8-4b6f-bfc4-eccf002d7e6d	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T18:24:46.616Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 18:24:46.634197
1efd57ad-fdf8-4bf1-ac8b-edf63ad900ad	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T18:24:46.622Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 18:24:46.647439
71a3c7fd-31ed-4b43-a1f4-ffda77b13ef8	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T18:24:47.181Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 18:24:47.200239
ada59bdf-ecee-4065-8996-a538c4e5dee8	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T18:29:59.334Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 18:29:59.352307
8f01b290-0343-49fb-8e9b-32ea8ed6f085	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T18:29:59.342Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 18:29:59.360668
fc1a7136-f869-465e-bc38-631febe420d5	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T18:29:59.439Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 18:29:59.457104
118efa81-7d5a-4174-914d-7d578093a23d	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T18:29:59.512Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 18:29:59.529659
665ff917-2ee3-4663-bd5c-fc26856b28f9	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T18:30:00.509Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 18:30:00.528203
6c7732a5-8422-40a9-a282-2630c2e21b40	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T18:34:46.748Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 18:34:46.768454
1a1c0395-1637-4e27-8471-dcf63b85697f	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T18:34:47.266Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 18:34:47.285814
64770ef0-e93d-4c43-9004-428b71b20040	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T18:34:46.752Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 18:34:46.771764
49b65035-d130-4f2d-8745-0204dfeb2e9a	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T18:34:46.756Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 18:34:46.774785
1382b9ba-9324-422f-85ea-d8965bc28288	CSP_VIOLATION	MEDIUM	CSP violation: unknown directive	{"timestamp": "2025-10-26T18:34:46.759Z", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}	f	\N	\N	2025-10-26 18:34:46.778316
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.sessions (sid, sess, expire) FROM stdin;
Q-V-1ndto4_oQwwwZu-JBT0TCjE-7vut	{"cookie": {"path": "/", "secure": true, "expires": "2025-11-02T17:53:25.724Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "passport": {"user": {"claims": {"aud": "fcc5c27b-aaf7-466d-a73d-e6f556736996", "exp": 1761504805, "iat": 1761501205, "iss": "https://replit.com/oidc", "sub": "33081217", "email": "chamomileberry525@gmail.com", "at_hash": "rJPykEZICWZJyMWf3azf9g", "username": "chamomileberry5", "auth_time": 1761501205, "last_name": null, "first_name": null}, "expires_at": 1761504805, "access_token": "NcJu_gGbMPATuAH0gT26ax6d8vFqkZdcaLDqMg9FwTK", "refresh_token": "yUw2m28PftAz9jdElSLl1UuSqSodE3E4hgCMz6qvjxv"}}}	2025-11-02 18:35:18
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.settings (id, name, location, time_period, population, climate, description, atmosphere, cultural_elements, notable_features, user_id, created_at, genre, setting_type, article_content, notebook_id, image_url, image_caption) FROM stdin;
\.


--
-- Data for Name: settlements; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.settlements (id, name, settlement_type, description, population, government, economy, defenses, culture, history, geography, climate, resources, threats, landmarks, districts, genre, user_id, created_at, notebook_id) FROM stdin;
\.


--
-- Data for Name: shares; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.shares (id, resource_type, resource_id, user_id, owner_id, permission, created_at) FROM stdin;
\.


--
-- Data for Name: societies; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.societies (id, name, society_type, description, structure, leadership, laws, "values", customs, economy, technology, education, military, religion, arts, history, genre, user_id, created_at, notebook_id) FROM stdin;
\.


--
-- Data for Name: species; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.species (id, name, classification, physical_description, habitat, behavior, diet, lifespan, intelligence, social_structure, abilities, weaknesses, cultural_traits, reproduction, genre, user_id, created_at, notebook_id, article_content, image_url, image_caption) FROM stdin;
\.


--
-- Data for Name: spells; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.spells (id, name, school, level, description, components, casting_time, range, duration, effect, limitations, rarity, origin, variations, risks, genre, user_id, created_at, notebook_id) FROM stdin;
\.


--
-- Data for Name: team_activity; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.team_activity (id, team_subscription_id, user_id, activity_type, resource_type, resource_id, resource_name, metadata, created_at) FROM stdin;
\.


--
-- Data for Name: team_invitations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.team_invitations (id, team_subscription_id, email, role, can_edit, can_comment, can_invite, invited_by, token, expires_at, status, created_at) FROM stdin;
\.


--
-- Data for Name: team_memberships; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.team_memberships (id, team_subscription_id, user_id, role, can_edit, can_comment, can_invite, created_at) FROM stdin;
\.


--
-- Data for Name: technologies; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.technologies (id, name, technology_type, description, function, principles, requirements, limitations, applications, development, inventors, rarity, risks, evolution, genre, user_id, created_at, notebook_id) FROM stdin;
\.


--
-- Data for Name: themes; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.themes (id, title, description, core_message, symbolic_elements, questions, conflicts, examples, genre, user_id, created_at, article_content, notebook_id, image_url, image_caption) FROM stdin;
\.


--
-- Data for Name: timeline_events; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.timeline_events (id, timeline_id, title, description, event_type, start_date, end_date, importance, category, color, icon, linked_content_id, linked_content_type, position_y, metadata, created_at, updated_at, position_x, character_ids) FROM stdin;
\.


--
-- Data for Name: timeline_relationships; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.timeline_relationships (id, timeline_id, from_event_id, to_event_id, relationship_type, description, created_at) FROM stdin;
\.


--
-- Data for Name: timelines; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.timelines (id, name, description, timeline_type, time_scale, start_date, end_date, scope, genre, user_id, created_at, notebook_id, view_mode, zoom, pan_x, pan_y, list_view_mode) FROM stdin;
\.


--
-- Data for Name: traditions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.traditions (id, name, tradition_type, description, origin, purpose, participants, procedure, timing, location, symbolism, significance, modern_practice, variations, related_traditions, genre, user_id, created_at, notebook_id) FROM stdin;
\.


--
-- Data for Name: transportation; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.transportation (id, name, transport_type, description, capacity, speed, range, requirements, construction, operation, cost, rarity, advantages, disadvantages, cultural_significance, genre, user_id, created_at, notebook_id) FROM stdin;
\.


--
-- Data for Name: user_preferences; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_preferences (id, user_id, experience_level, preferred_genres, writing_goals, feedback_style, target_word_count, writing_schedule, preferred_tone, created_at, updated_at, response_format, detail_level, examples_preference, onboarding_completed, onboarding_step, beta_banner_dismissed) FROM stdin;
204d7f6b-51a2-41d5-b5a4-92c180f6fe4a	33081217	experienced_worldbuilder	\N	\N	\N	\N	\N	\N	2025-10-26 18:15:05.320409	2025-10-26 18:15:25.504	\N	\N	\N	t	1	f
\.


--
-- Data for Name: user_subscriptions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_subscriptions (id, user_id, tier, status, stripe_customer_id, stripe_subscription_id, stripe_price_id, current_period_start, current_period_end, cancel_at_period_end, trial_start, trial_end, created_at, updated_at, paused_at, resumes_at, pause_reason, grace_period_start, grace_period_end) FROM stdin;
e66018ee-37fd-49ec-809e-79ab02ee62b2	33081217	free	active	\N	\N	\N	\N	\N	f	\N	\N	2025-10-26 18:00:22.78746	2025-10-26 18:00:22.77	\N	\N	\N	\N	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, created_at, email, first_name, last_name, profile_image_url, updated_at, is_admin, subscription_tier, grandfathered_tier, onboarding_completed, trial_used, mfa_enabled, mfa_secret, backup_codes) FROM stdin;
33081217	2025-10-26 17:26:52.325939	chamomileberry525@gmail.com	\N	\N	\N	2025-10-26 17:53:25.559	f	free	\N	f	f	f	\N	\N
\.


--
-- Data for Name: weapons; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.weapons (id, name, weapon_type, description, damage, range, weight, materials, craftsmanship, enchantments, history, rarity, value, requirements, maintenance, genre, user_id, created_at, notebook_id, article_content, image_url, image_caption) FROM stdin;
\.


--
-- Name: accessories accessories_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.accessories
    ADD CONSTRAINT accessories_pkey PRIMARY KEY (id);


--
-- Name: ai_usage_daily_summary ai_usage_daily_summary_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ai_usage_daily_summary
    ADD CONSTRAINT ai_usage_daily_summary_pkey PRIMARY KEY (id);


--
-- Name: ai_usage_logs ai_usage_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ai_usage_logs
    ADD CONSTRAINT ai_usage_logs_pkey PRIMARY KEY (id);


--
-- Name: animals animals_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.animals
    ADD CONSTRAINT animals_pkey PRIMARY KEY (id);


--
-- Name: api_key_rotation_audit api_key_rotation_audit_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.api_key_rotation_audit
    ADD CONSTRAINT api_key_rotation_audit_pkey PRIMARY KEY (id);


--
-- Name: api_key_rotations api_key_rotations_key_name_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.api_key_rotations
    ADD CONSTRAINT api_key_rotations_key_name_unique UNIQUE (key_name);


--
-- Name: api_key_rotations api_key_rotations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.api_key_rotations
    ADD CONSTRAINT api_key_rotations_pkey PRIMARY KEY (id);


--
-- Name: api_key_usage_logs api_key_usage_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.api_key_usage_logs
    ADD CONSTRAINT api_key_usage_logs_pkey PRIMARY KEY (id);


--
-- Name: api_keys api_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_pkey PRIMARY KEY (id);


--
-- Name: armor armor_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.armor
    ADD CONSTRAINT armor_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: banned_phrases banned_phrases_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.banned_phrases
    ADD CONSTRAINT banned_phrases_pkey PRIMARY KEY (id);


--
-- Name: billing_alerts billing_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.billing_alerts
    ADD CONSTRAINT billing_alerts_pkey PRIMARY KEY (id);


--
-- Name: buildings buildings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.buildings
    ADD CONSTRAINT buildings_pkey PRIMARY KEY (id);


--
-- Name: canvases canvases_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.canvases
    ADD CONSTRAINT canvases_pkey PRIMARY KEY (id);


--
-- Name: ceremonies ceremonies_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ceremonies
    ADD CONSTRAINT ceremonies_pkey PRIMARY KEY (id);


--
-- Name: characters characters_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.characters
    ADD CONSTRAINT characters_pkey PRIMARY KEY (id);


--
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


--
-- Name: clothing clothing_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.clothing
    ADD CONSTRAINT clothing_pkey PRIMARY KEY (id);


--
-- Name: conditions conditions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.conditions
    ADD CONSTRAINT conditions_pkey PRIMARY KEY (id);


--
-- Name: conflicts conflicts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.conflicts
    ADD CONSTRAINT conflicts_pkey PRIMARY KEY (id);


--
-- Name: conversation_summaries conversation_summaries_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.conversation_summaries
    ADD CONSTRAINT conversation_summaries_pkey PRIMARY KEY (id);


--
-- Name: conversation_threads conversation_threads_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.conversation_threads
    ADD CONSTRAINT conversation_threads_pkey PRIMARY KEY (id);


--
-- Name: creatures creatures_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.creatures
    ADD CONSTRAINT creatures_pkey PRIMARY KEY (id);


--
-- Name: cultures cultures_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.cultures
    ADD CONSTRAINT cultures_pkey PRIMARY KEY (id);


--
-- Name: dances dances_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.dances
    ADD CONSTRAINT dances_pkey PRIMARY KEY (id);


--
-- Name: descriptions descriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.descriptions
    ADD CONSTRAINT descriptions_pkey PRIMARY KEY (id);


--
-- Name: discount_code_usage discount_code_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.discount_code_usage
    ADD CONSTRAINT discount_code_usage_pkey PRIMARY KEY (id);


--
-- Name: discount_codes discount_codes_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.discount_codes
    ADD CONSTRAINT discount_codes_code_unique UNIQUE (code);


--
-- Name: discount_codes discount_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.discount_codes
    ADD CONSTRAINT discount_codes_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: drinks drinks_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.drinks
    ADD CONSTRAINT drinks_pkey PRIMARY KEY (id);


--
-- Name: ethnicities ethnicities_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ethnicities
    ADD CONSTRAINT ethnicities_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: factions factions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.factions
    ADD CONSTRAINT factions_pkey PRIMARY KEY (id);


--
-- Name: family_tree_members family_tree_members_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.family_tree_members
    ADD CONSTRAINT family_tree_members_pkey PRIMARY KEY (id);


--
-- Name: family_tree_relationships family_tree_relationships_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.family_tree_relationships
    ADD CONSTRAINT family_tree_relationships_pkey PRIMARY KEY (id);


--
-- Name: family_trees family_trees_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.family_trees
    ADD CONSTRAINT family_trees_pkey PRIMARY KEY (id);


--
-- Name: feedback feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT feedback_pkey PRIMARY KEY (id);


--
-- Name: folders folders_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.folders
    ADD CONSTRAINT folders_pkey PRIMARY KEY (id);


--
-- Name: foods foods_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.foods
    ADD CONSTRAINT foods_pkey PRIMARY KEY (id);


--
-- Name: guide_categories guide_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.guide_categories
    ADD CONSTRAINT guide_categories_pkey PRIMARY KEY (id);


--
-- Name: guide_references guide_references_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.guide_references
    ADD CONSTRAINT guide_references_pkey PRIMARY KEY (id);


--
-- Name: guides guides_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.guides
    ADD CONSTRAINT guides_pkey PRIMARY KEY (id);


--
-- Name: import_jobs import_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.import_jobs
    ADD CONSTRAINT import_jobs_pkey PRIMARY KEY (id);


--
-- Name: intrusion_attempts intrusion_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.intrusion_attempts
    ADD CONSTRAINT intrusion_attempts_pkey PRIMARY KEY (id);


--
-- Name: ip_blocks ip_blocks_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ip_blocks
    ADD CONSTRAINT ip_blocks_pkey PRIMARY KEY (id);


--
-- Name: items items_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_pkey PRIMARY KEY (id);


--
-- Name: languages languages_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.languages
    ADD CONSTRAINT languages_pkey PRIMARY KEY (id);


--
-- Name: laws laws_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.laws
    ADD CONSTRAINT laws_pkey PRIMARY KEY (id);


--
-- Name: legends legends_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.legends
    ADD CONSTRAINT legends_pkey PRIMARY KEY (id);


--
-- Name: lifetime_subscriptions lifetime_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.lifetime_subscriptions
    ADD CONSTRAINT lifetime_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: locations locations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_pkey PRIMARY KEY (id);


--
-- Name: project_links manuscript_links_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.project_links
    ADD CONSTRAINT manuscript_links_pkey PRIMARY KEY (id);


--
-- Name: projects manuscripts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT manuscripts_pkey PRIMARY KEY (id);


--
-- Name: maps maps_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.maps
    ADD CONSTRAINT maps_pkey PRIMARY KEY (id);


--
-- Name: materials materials_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.materials
    ADD CONSTRAINT materials_pkey PRIMARY KEY (id);


--
-- Name: military_units military_units_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.military_units
    ADD CONSTRAINT military_units_pkey PRIMARY KEY (id);


--
-- Name: moods moods_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.moods
    ADD CONSTRAINT moods_pkey PRIMARY KEY (id);


--
-- Name: music music_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.music
    ADD CONSTRAINT music_pkey PRIMARY KEY (id);


--
-- Name: myths myths_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.myths
    ADD CONSTRAINT myths_pkey PRIMARY KEY (id);


--
-- Name: names names_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.names
    ADD CONSTRAINT names_pkey PRIMARY KEY (id);


--
-- Name: natural_laws natural_laws_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.natural_laws
    ADD CONSTRAINT natural_laws_pkey PRIMARY KEY (id);


--
-- Name: notebooks notebooks_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notebooks
    ADD CONSTRAINT notebooks_pkey PRIMARY KEY (id);


--
-- Name: notes notes_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- Name: pinned_content pinned_content_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pinned_content
    ADD CONSTRAINT pinned_content_pkey PRIMARY KEY (id);


--
-- Name: plants plants_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.plants
    ADD CONSTRAINT plants_pkey PRIMARY KEY (id);


--
-- Name: plots plots_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.plots
    ADD CONSTRAINT plots_pkey PRIMARY KEY (id);


--
-- Name: policies policies_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.policies
    ADD CONSTRAINT policies_pkey PRIMARY KEY (id);


--
-- Name: potions potions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.potions
    ADD CONSTRAINT potions_pkey PRIMARY KEY (id);


--
-- Name: professions professions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.professions
    ADD CONSTRAINT professions_pkey PRIMARY KEY (id);


--
-- Name: project_sections project_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.project_sections
    ADD CONSTRAINT project_sections_pkey PRIMARY KEY (id);


--
-- Name: prompts prompts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.prompts
    ADD CONSTRAINT prompts_pkey PRIMARY KEY (id);


--
-- Name: ranks ranks_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ranks
    ADD CONSTRAINT ranks_pkey PRIMARY KEY (id);


--
-- Name: religions religions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.religions
    ADD CONSTRAINT religions_pkey PRIMARY KEY (id);


--
-- Name: resources resources_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_pkey PRIMARY KEY (id);


--
-- Name: rituals rituals_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.rituals
    ADD CONSTRAINT rituals_pkey PRIMARY KEY (id);


--
-- Name: saved_items saved_items_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.saved_items
    ADD CONSTRAINT saved_items_pkey PRIMARY KEY (id);


--
-- Name: security_alerts security_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.security_alerts
    ADD CONSTRAINT security_alerts_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: settlements settlements_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.settlements
    ADD CONSTRAINT settlements_pkey PRIMARY KEY (id);


--
-- Name: shares shares_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shares
    ADD CONSTRAINT shares_pkey PRIMARY KEY (id);


--
-- Name: societies societies_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.societies
    ADD CONSTRAINT societies_pkey PRIMARY KEY (id);


--
-- Name: species species_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.species
    ADD CONSTRAINT species_pkey PRIMARY KEY (id);


--
-- Name: spells spells_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.spells
    ADD CONSTRAINT spells_pkey PRIMARY KEY (id);


--
-- Name: team_activity team_activity_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.team_activity
    ADD CONSTRAINT team_activity_pkey PRIMARY KEY (id);


--
-- Name: team_invitations team_invitations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.team_invitations
    ADD CONSTRAINT team_invitations_pkey PRIMARY KEY (id);


--
-- Name: team_invitations team_invitations_token_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.team_invitations
    ADD CONSTRAINT team_invitations_token_unique UNIQUE (token);


--
-- Name: team_memberships team_memberships_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.team_memberships
    ADD CONSTRAINT team_memberships_pkey PRIMARY KEY (id);


--
-- Name: technologies technologies_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.technologies
    ADD CONSTRAINT technologies_pkey PRIMARY KEY (id);


--
-- Name: themes themes_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.themes
    ADD CONSTRAINT themes_pkey PRIMARY KEY (id);


--
-- Name: timeline_events timeline_events_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.timeline_events
    ADD CONSTRAINT timeline_events_pkey PRIMARY KEY (id);


--
-- Name: timeline_relationships timeline_relationships_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.timeline_relationships
    ADD CONSTRAINT timeline_relationships_pkey PRIMARY KEY (id);


--
-- Name: timelines timelines_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.timelines
    ADD CONSTRAINT timelines_pkey PRIMARY KEY (id);


--
-- Name: traditions traditions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.traditions
    ADD CONSTRAINT traditions_pkey PRIMARY KEY (id);


--
-- Name: transportation transportation_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.transportation
    ADD CONSTRAINT transportation_pkey PRIMARY KEY (id);


--
-- Name: user_preferences user_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT user_preferences_pkey PRIMARY KEY (id);


--
-- Name: user_preferences user_preferences_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT user_preferences_user_id_unique UNIQUE (user_id);


--
-- Name: user_subscriptions user_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: user_subscriptions user_subscriptions_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_user_id_unique UNIQUE (user_id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: weapons weapons_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.weapons
    ADD CONSTRAINT weapons_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "IDX_session_expire" ON public.sessions USING btree (expire);


--
-- Name: ai_usage_daily_summary_user_date_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX ai_usage_daily_summary_user_date_idx ON public.ai_usage_daily_summary USING btree (user_id, date);


--
-- Name: ai_usage_logs_user_date_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX ai_usage_logs_user_date_idx ON public.ai_usage_logs USING btree (user_id, created_at);


--
-- Name: ai_usage_logs_user_operation_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX ai_usage_logs_user_operation_idx ON public.ai_usage_logs USING btree (user_id, operation_type);


--
-- Name: api_key_rotation_audit_key_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX api_key_rotation_audit_key_idx ON public.api_key_rotation_audit USING btree (key_rotation_id);


--
-- Name: api_key_rotation_audit_timestamp_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX api_key_rotation_audit_timestamp_idx ON public.api_key_rotation_audit USING btree ("timestamp");


--
-- Name: api_key_rotations_next_rotation_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX api_key_rotations_next_rotation_idx ON public.api_key_rotations USING btree (next_rotation_due);


--
-- Name: api_key_rotations_status_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX api_key_rotations_status_idx ON public.api_key_rotations USING btree (rotation_status);


--
-- Name: api_key_usage_logs_endpoint_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX api_key_usage_logs_endpoint_idx ON public.api_key_usage_logs USING btree (endpoint);


--
-- Name: api_key_usage_logs_key_date_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX api_key_usage_logs_key_date_idx ON public.api_key_usage_logs USING btree (api_key_id, created_at);


--
-- Name: api_key_usage_logs_user_date_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX api_key_usage_logs_user_date_idx ON public.api_key_usage_logs USING btree (user_id, created_at);


--
-- Name: api_keys_key_hash_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX api_keys_key_hash_idx ON public.api_keys USING btree (key_hash);


--
-- Name: api_keys_prefix_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX api_keys_prefix_idx ON public.api_keys USING btree (prefix);


--
-- Name: api_keys_user_active_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX api_keys_user_active_idx ON public.api_keys USING btree (user_id, is_active);


--
-- Name: audit_logs_action_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX audit_logs_action_idx ON public.audit_logs USING btree (action);


--
-- Name: audit_logs_resource_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX audit_logs_resource_idx ON public.audit_logs USING btree (resource_type, resource_id);


--
-- Name: audit_logs_team_created_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX audit_logs_team_created_idx ON public.audit_logs USING btree (team_subscription_id, created_at);


--
-- Name: audit_logs_user_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX audit_logs_user_idx ON public.audit_logs USING btree (user_id);


--
-- Name: billing_alerts_created_at_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX billing_alerts_created_at_idx ON public.billing_alerts USING btree (created_at);


--
-- Name: billing_alerts_type_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX billing_alerts_type_idx ON public.billing_alerts USING btree (type);


--
-- Name: billing_alerts_user_status_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX billing_alerts_user_status_idx ON public.billing_alerts USING btree (user_id, status);


--
-- Name: canvas_project_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX canvas_project_idx ON public.canvases USING btree (project_id);


--
-- Name: canvas_template_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX canvas_template_idx ON public.canvases USING btree (is_template);


--
-- Name: canvas_user_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX canvas_user_idx ON public.canvases USING btree (user_id);


--
-- Name: chat_messages_created_at_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX chat_messages_created_at_idx ON public.chat_messages USING btree (created_at);


--
-- Name: chat_messages_guide_id_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX chat_messages_guide_id_idx ON public.chat_messages USING btree (guide_id);


--
-- Name: chat_messages_project_id_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX chat_messages_project_id_idx ON public.chat_messages USING btree (project_id);


--
-- Name: chat_messages_thread_id_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX chat_messages_thread_id_idx ON public.chat_messages USING btree (thread_id);


--
-- Name: chat_messages_user_id_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX chat_messages_user_id_idx ON public.chat_messages USING btree (user_id);


--
-- Name: conversation_summaries_guide_id_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX conversation_summaries_guide_id_idx ON public.conversation_summaries USING btree (guide_id);


--
-- Name: conversation_summaries_last_discussed_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX conversation_summaries_last_discussed_idx ON public.conversation_summaries USING btree (last_discussed);


--
-- Name: conversation_summaries_project_id_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX conversation_summaries_project_id_idx ON public.conversation_summaries USING btree (project_id);


--
-- Name: conversation_summaries_unique_scope; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX conversation_summaries_unique_scope ON public.conversation_summaries USING btree (user_id, COALESCE(project_id, ''::character varying), COALESCE(guide_id, ''::character varying));


--
-- Name: conversation_summaries_user_id_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX conversation_summaries_user_id_idx ON public.conversation_summaries USING btree (user_id);


--
-- Name: conversation_threads_active_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX conversation_threads_active_idx ON public.conversation_threads USING btree (is_active);


--
-- Name: conversation_threads_guide_id_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX conversation_threads_guide_id_idx ON public.conversation_threads USING btree (guide_id);


--
-- Name: conversation_threads_last_activity_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX conversation_threads_last_activity_idx ON public.conversation_threads USING btree (last_activity_at);


--
-- Name: conversation_threads_parent_id_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX conversation_threads_parent_id_idx ON public.conversation_threads USING btree (parent_thread_id);


--
-- Name: conversation_threads_project_id_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX conversation_threads_project_id_idx ON public.conversation_threads USING btree (project_id);


--
-- Name: conversation_threads_tags_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX conversation_threads_tags_idx ON public.conversation_threads USING btree (tags);


--
-- Name: conversation_threads_user_id_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX conversation_threads_user_id_idx ON public.conversation_threads USING btree (user_id);


--
-- Name: discount_code_usage_code_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX discount_code_usage_code_idx ON public.discount_code_usage USING btree (discount_code_id);


--
-- Name: discount_code_usage_user_code_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX discount_code_usage_user_code_idx ON public.discount_code_usage USING btree (user_id, discount_code_id);


--
-- Name: discount_codes_active_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX discount_codes_active_idx ON public.discount_codes USING btree (active);


--
-- Name: discount_codes_code_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX discount_codes_code_idx ON public.discount_codes USING btree (code);


--
-- Name: discount_codes_expires_at_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX discount_codes_expires_at_idx ON public.discount_codes USING btree (expires_at);


--
-- Name: feedback_created_at_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX feedback_created_at_idx ON public.feedback USING btree (created_at);


--
-- Name: feedback_status_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX feedback_status_idx ON public.feedback USING btree (status);


--
-- Name: feedback_type_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX feedback_type_idx ON public.feedback USING btree (type);


--
-- Name: feedback_user_id_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX feedback_user_id_idx ON public.feedback USING btree (user_id);


--
-- Name: idx_project_sections_parent; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_project_sections_parent ON public.project_sections USING btree (parent_id);


--
-- Name: idx_project_sections_project; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_project_sections_project ON public.project_sections USING btree (project_id);


--
-- Name: intrusion_attempts_created_at_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX intrusion_attempts_created_at_idx ON public.intrusion_attempts USING btree (created_at);


--
-- Name: intrusion_attempts_ip_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX intrusion_attempts_ip_idx ON public.intrusion_attempts USING btree (ip_address);


--
-- Name: intrusion_attempts_severity_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX intrusion_attempts_severity_idx ON public.intrusion_attempts USING btree (severity);


--
-- Name: intrusion_attempts_type_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX intrusion_attempts_type_idx ON public.intrusion_attempts USING btree (attack_type);


--
-- Name: ip_blocks_expires_at_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX ip_blocks_expires_at_idx ON public.ip_blocks USING btree (expires_at);


--
-- Name: ip_blocks_ip_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX ip_blocks_ip_idx ON public.ip_blocks USING btree (ip_address);


--
-- Name: ip_blocks_unique_active_ip_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX ip_blocks_unique_active_ip_idx ON public.ip_blocks USING btree (ip_address) WHERE (is_active = true);


--
-- Name: lifetime_subscriptions_user_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX lifetime_subscriptions_user_idx ON public.lifetime_subscriptions USING btree (user_id);


--
-- Name: notebooks_user_default_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX notebooks_user_default_idx ON public.notebooks USING btree (user_id) WHERE (is_default = true);


--
-- Name: project_search_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX project_search_idx ON public.projects USING gin (search_vector);


--
-- Name: saved_items_unique_user_notebook_item_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX saved_items_unique_user_notebook_item_idx ON public.saved_items USING btree (user_id, notebook_id, item_type, item_id);


--
-- Name: security_alerts_acknowledged_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX security_alerts_acknowledged_idx ON public.security_alerts USING btree (acknowledged);


--
-- Name: security_alerts_created_at_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX security_alerts_created_at_idx ON public.security_alerts USING btree (created_at);


--
-- Name: security_alerts_severity_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX security_alerts_severity_idx ON public.security_alerts USING btree (severity);


--
-- Name: shares_unique_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX shares_unique_idx ON public.shares USING btree (resource_type, resource_id, user_id);


--
-- Name: team_activity_team_created_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX team_activity_team_created_idx ON public.team_activity USING btree (team_subscription_id, created_at);


--
-- Name: team_activity_user_created_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX team_activity_user_created_idx ON public.team_activity USING btree (user_id, created_at);


--
-- Name: team_invitations_team_email_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX team_invitations_team_email_idx ON public.team_invitations USING btree (team_subscription_id, email) WHERE ((status)::text = 'pending'::text);


--
-- Name: team_invitations_token_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX team_invitations_token_idx ON public.team_invitations USING btree (token);


--
-- Name: team_memberships_team_user_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX team_memberships_team_user_idx ON public.team_memberships USING btree (team_subscription_id, user_id);


--
-- Name: user_preferences_user_id_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX user_preferences_user_id_idx ON public.user_preferences USING btree (user_id);


--
-- Name: user_subscriptions_stripe_customer_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX user_subscriptions_stripe_customer_idx ON public.user_subscriptions USING btree (stripe_customer_id);


--
-- Name: user_subscriptions_stripe_subscription_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX user_subscriptions_stripe_subscription_idx ON public.user_subscriptions USING btree (stripe_subscription_id);


--
-- Name: accessories accessories_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.accessories
    ADD CONSTRAINT accessories_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: accessories accessories_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.accessories
    ADD CONSTRAINT accessories_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: ai_usage_daily_summary ai_usage_daily_summary_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ai_usage_daily_summary
    ADD CONSTRAINT ai_usage_daily_summary_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: ai_usage_logs ai_usage_logs_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ai_usage_logs
    ADD CONSTRAINT ai_usage_logs_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE SET NULL;


--
-- Name: ai_usage_logs ai_usage_logs_project_id_projects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ai_usage_logs
    ADD CONSTRAINT ai_usage_logs_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;


--
-- Name: ai_usage_logs ai_usage_logs_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ai_usage_logs
    ADD CONSTRAINT ai_usage_logs_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: animals animals_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.animals
    ADD CONSTRAINT animals_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: animals animals_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.animals
    ADD CONSTRAINT animals_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: api_key_rotation_audit api_key_rotation_audit_key_rotation_id_api_key_rotations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.api_key_rotation_audit
    ADD CONSTRAINT api_key_rotation_audit_key_rotation_id_api_key_rotations_id_fk FOREIGN KEY (key_rotation_id) REFERENCES public.api_key_rotations(id) ON DELETE CASCADE;


--
-- Name: api_key_rotation_audit api_key_rotation_audit_performed_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.api_key_rotation_audit
    ADD CONSTRAINT api_key_rotation_audit_performed_by_users_id_fk FOREIGN KEY (performed_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: api_key_rotations api_key_rotations_last_rotated_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.api_key_rotations
    ADD CONSTRAINT api_key_rotations_last_rotated_by_users_id_fk FOREIGN KEY (last_rotated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: api_key_usage_logs api_key_usage_logs_api_key_id_api_keys_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.api_key_usage_logs
    ADD CONSTRAINT api_key_usage_logs_api_key_id_api_keys_id_fk FOREIGN KEY (api_key_id) REFERENCES public.api_keys(id) ON DELETE CASCADE;


--
-- Name: api_key_usage_logs api_key_usage_logs_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.api_key_usage_logs
    ADD CONSTRAINT api_key_usage_logs_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: api_keys api_keys_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: armor armor_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.armor
    ADD CONSTRAINT armor_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: armor armor_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.armor
    ADD CONSTRAINT armor_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: audit_logs audit_logs_team_subscription_id_user_subscriptions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_team_subscription_id_user_subscriptions_id_fk FOREIGN KEY (team_subscription_id) REFERENCES public.user_subscriptions(id) ON DELETE CASCADE;


--
-- Name: audit_logs audit_logs_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: billing_alerts billing_alerts_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.billing_alerts
    ADD CONSTRAINT billing_alerts_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: buildings buildings_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.buildings
    ADD CONSTRAINT buildings_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: buildings buildings_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.buildings
    ADD CONSTRAINT buildings_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: canvases canvases_project_id_projects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.canvases
    ADD CONSTRAINT canvases_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: canvases canvases_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.canvases
    ADD CONSTRAINT canvases_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: ceremonies ceremonies_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ceremonies
    ADD CONSTRAINT ceremonies_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: ceremonies ceremonies_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ceremonies
    ADD CONSTRAINT ceremonies_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: characters characters_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.characters
    ADD CONSTRAINT characters_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: characters characters_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.characters
    ADD CONSTRAINT characters_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: chat_messages chat_messages_guide_id_guides_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_guide_id_guides_id_fk FOREIGN KEY (guide_id) REFERENCES public.guides(id) ON DELETE CASCADE;


--
-- Name: chat_messages chat_messages_project_id_projects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: chat_messages chat_messages_thread_id_conversation_threads_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_thread_id_conversation_threads_id_fk FOREIGN KEY (thread_id) REFERENCES public.conversation_threads(id) ON DELETE CASCADE;


--
-- Name: chat_messages chat_messages_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: clothing clothing_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.clothing
    ADD CONSTRAINT clothing_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: clothing clothing_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.clothing
    ADD CONSTRAINT clothing_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: conditions conditions_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.conditions
    ADD CONSTRAINT conditions_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: conditions conditions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.conditions
    ADD CONSTRAINT conditions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: conflicts conflicts_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.conflicts
    ADD CONSTRAINT conflicts_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: conflicts conflicts_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.conflicts
    ADD CONSTRAINT conflicts_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: conversation_summaries conversation_summaries_guide_id_guides_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.conversation_summaries
    ADD CONSTRAINT conversation_summaries_guide_id_guides_id_fk FOREIGN KEY (guide_id) REFERENCES public.guides(id) ON DELETE CASCADE;


--
-- Name: conversation_summaries conversation_summaries_project_id_projects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.conversation_summaries
    ADD CONSTRAINT conversation_summaries_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: conversation_summaries conversation_summaries_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.conversation_summaries
    ADD CONSTRAINT conversation_summaries_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: conversation_threads conversation_threads_guide_id_guides_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.conversation_threads
    ADD CONSTRAINT conversation_threads_guide_id_guides_id_fk FOREIGN KEY (guide_id) REFERENCES public.guides(id) ON DELETE CASCADE;


--
-- Name: conversation_threads conversation_threads_parent_thread_id_conversation_threads_id_f; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.conversation_threads
    ADD CONSTRAINT conversation_threads_parent_thread_id_conversation_threads_id_f FOREIGN KEY (parent_thread_id) REFERENCES public.conversation_threads(id) ON DELETE SET NULL;


--
-- Name: conversation_threads conversation_threads_project_id_projects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.conversation_threads
    ADD CONSTRAINT conversation_threads_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: conversation_threads conversation_threads_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.conversation_threads
    ADD CONSTRAINT conversation_threads_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: creatures creatures_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.creatures
    ADD CONSTRAINT creatures_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: creatures creatures_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.creatures
    ADD CONSTRAINT creatures_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: cultures cultures_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.cultures
    ADD CONSTRAINT cultures_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: cultures cultures_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.cultures
    ADD CONSTRAINT cultures_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: dances dances_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.dances
    ADD CONSTRAINT dances_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: dances dances_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.dances
    ADD CONSTRAINT dances_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: descriptions descriptions_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.descriptions
    ADD CONSTRAINT descriptions_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: descriptions descriptions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.descriptions
    ADD CONSTRAINT descriptions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: discount_code_usage discount_code_usage_discount_code_id_discount_codes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.discount_code_usage
    ADD CONSTRAINT discount_code_usage_discount_code_id_discount_codes_id_fk FOREIGN KEY (discount_code_id) REFERENCES public.discount_codes(id) ON DELETE CASCADE;


--
-- Name: discount_code_usage discount_code_usage_subscription_id_user_subscriptions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.discount_code_usage
    ADD CONSTRAINT discount_code_usage_subscription_id_user_subscriptions_id_fk FOREIGN KEY (subscription_id) REFERENCES public.user_subscriptions(id) ON DELETE SET NULL;


--
-- Name: discount_code_usage discount_code_usage_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.discount_code_usage
    ADD CONSTRAINT discount_code_usage_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: discount_codes discount_codes_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.discount_codes
    ADD CONSTRAINT discount_codes_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: documents documents_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: documents documents_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: drinks drinks_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.drinks
    ADD CONSTRAINT drinks_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: drinks drinks_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.drinks
    ADD CONSTRAINT drinks_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: ethnicities ethnicities_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ethnicities
    ADD CONSTRAINT ethnicities_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: ethnicities ethnicities_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ethnicities
    ADD CONSTRAINT ethnicities_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: events events_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: events events_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: factions factions_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.factions
    ADD CONSTRAINT factions_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: factions factions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.factions
    ADD CONSTRAINT factions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: family_tree_members family_tree_members_character_id_characters_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.family_tree_members
    ADD CONSTRAINT family_tree_members_character_id_characters_id_fk FOREIGN KEY (character_id) REFERENCES public.characters(id) ON DELETE SET NULL;


--
-- Name: family_tree_members family_tree_members_tree_id_family_trees_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.family_tree_members
    ADD CONSTRAINT family_tree_members_tree_id_family_trees_id_fk FOREIGN KEY (tree_id) REFERENCES public.family_trees(id) ON DELETE CASCADE;


--
-- Name: family_tree_relationships family_tree_relationships_from_member_id_family_tree_members_id; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.family_tree_relationships
    ADD CONSTRAINT family_tree_relationships_from_member_id_family_tree_members_id FOREIGN KEY (from_member_id) REFERENCES public.family_tree_members(id) ON DELETE CASCADE;


--
-- Name: family_tree_relationships family_tree_relationships_to_member_id_family_tree_members_id_f; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.family_tree_relationships
    ADD CONSTRAINT family_tree_relationships_to_member_id_family_tree_members_id_f FOREIGN KEY (to_member_id) REFERENCES public.family_tree_members(id) ON DELETE CASCADE;


--
-- Name: family_tree_relationships family_tree_relationships_tree_id_family_trees_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.family_tree_relationships
    ADD CONSTRAINT family_tree_relationships_tree_id_family_trees_id_fk FOREIGN KEY (tree_id) REFERENCES public.family_trees(id) ON DELETE CASCADE;


--
-- Name: family_trees family_trees_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.family_trees
    ADD CONSTRAINT family_trees_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: family_trees family_trees_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.family_trees
    ADD CONSTRAINT family_trees_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: feedback feedback_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT feedback_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: folders folders_guide_id_guides_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.folders
    ADD CONSTRAINT folders_guide_id_guides_id_fk FOREIGN KEY (guide_id) REFERENCES public.guides(id) ON DELETE CASCADE;


--
-- Name: folders folders_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.folders
    ADD CONSTRAINT folders_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: foods foods_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.foods
    ADD CONSTRAINT foods_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: foods foods_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.foods
    ADD CONSTRAINT foods_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: guide_categories guide_categories_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.guide_categories
    ADD CONSTRAINT guide_categories_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: guide_references guide_references_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.guide_references
    ADD CONSTRAINT guide_references_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: import_jobs import_jobs_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.import_jobs
    ADD CONSTRAINT import_jobs_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: import_jobs import_jobs_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.import_jobs
    ADD CONSTRAINT import_jobs_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: intrusion_attempts intrusion_attempts_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.intrusion_attempts
    ADD CONSTRAINT intrusion_attempts_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: ip_blocks ip_blocks_blocked_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ip_blocks
    ADD CONSTRAINT ip_blocks_blocked_by_users_id_fk FOREIGN KEY (blocked_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: ip_blocks ip_blocks_intrusion_attempt_id_intrusion_attempts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ip_blocks
    ADD CONSTRAINT ip_blocks_intrusion_attempt_id_intrusion_attempts_id_fk FOREIGN KEY (intrusion_attempt_id) REFERENCES public.intrusion_attempts(id) ON DELETE SET NULL;


--
-- Name: items items_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: items items_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: languages languages_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.languages
    ADD CONSTRAINT languages_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: languages languages_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.languages
    ADD CONSTRAINT languages_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: laws laws_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.laws
    ADD CONSTRAINT laws_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: laws laws_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.laws
    ADD CONSTRAINT laws_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: legends legends_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.legends
    ADD CONSTRAINT legends_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: legends legends_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.legends
    ADD CONSTRAINT legends_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: lifetime_subscriptions lifetime_subscriptions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.lifetime_subscriptions
    ADD CONSTRAINT lifetime_subscriptions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: locations locations_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: locations locations_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: maps maps_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.maps
    ADD CONSTRAINT maps_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: maps maps_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.maps
    ADD CONSTRAINT maps_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: materials materials_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.materials
    ADD CONSTRAINT materials_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: materials materials_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.materials
    ADD CONSTRAINT materials_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: military_units military_units_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.military_units
    ADD CONSTRAINT military_units_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: military_units military_units_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.military_units
    ADD CONSTRAINT military_units_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: moods moods_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.moods
    ADD CONSTRAINT moods_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: moods moods_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.moods
    ADD CONSTRAINT moods_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: music music_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.music
    ADD CONSTRAINT music_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: music music_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.music
    ADD CONSTRAINT music_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: myths myths_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.myths
    ADD CONSTRAINT myths_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: myths myths_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.myths
    ADD CONSTRAINT myths_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: names names_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.names
    ADD CONSTRAINT names_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: names names_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.names
    ADD CONSTRAINT names_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: natural_laws natural_laws_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.natural_laws
    ADD CONSTRAINT natural_laws_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: natural_laws natural_laws_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.natural_laws
    ADD CONSTRAINT natural_laws_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notebooks notebooks_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notebooks
    ADD CONSTRAINT notebooks_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notes notes_folder_id_folders_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_folder_id_folders_id_fk FOREIGN KEY (folder_id) REFERENCES public.folders(id) ON DELETE CASCADE;


--
-- Name: notes notes_guide_id_guides_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_guide_id_guides_id_fk FOREIGN KEY (guide_id) REFERENCES public.guides(id) ON DELETE CASCADE;


--
-- Name: notes notes_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: organizations organizations_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: organizations organizations_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: pinned_content pinned_content_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pinned_content
    ADD CONSTRAINT pinned_content_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: pinned_content pinned_content_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pinned_content
    ADD CONSTRAINT pinned_content_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: plants plants_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.plants
    ADD CONSTRAINT plants_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: plants plants_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.plants
    ADD CONSTRAINT plants_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: plots plots_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.plots
    ADD CONSTRAINT plots_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: plots plots_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.plots
    ADD CONSTRAINT plots_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: policies policies_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.policies
    ADD CONSTRAINT policies_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: policies policies_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.policies
    ADD CONSTRAINT policies_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: potions potions_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.potions
    ADD CONSTRAINT potions_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: potions potions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.potions
    ADD CONSTRAINT potions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: professions professions_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.professions
    ADD CONSTRAINT professions_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: professions professions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.professions
    ADD CONSTRAINT professions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: project_links project_links_source_id_projects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.project_links
    ADD CONSTRAINT project_links_source_id_projects_id_fk FOREIGN KEY (source_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_links project_links_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.project_links
    ADD CONSTRAINT project_links_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: project_sections project_sections_project_id_projects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.project_sections
    ADD CONSTRAINT project_sections_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: projects projects_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: prompts prompts_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.prompts
    ADD CONSTRAINT prompts_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: prompts prompts_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.prompts
    ADD CONSTRAINT prompts_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: ranks ranks_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ranks
    ADD CONSTRAINT ranks_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: ranks ranks_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ranks
    ADD CONSTRAINT ranks_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: religions religions_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.religions
    ADD CONSTRAINT religions_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: religions religions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.religions
    ADD CONSTRAINT religions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: resources resources_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: resources resources_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: rituals rituals_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.rituals
    ADD CONSTRAINT rituals_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: rituals rituals_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.rituals
    ADD CONSTRAINT rituals_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: saved_items saved_items_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.saved_items
    ADD CONSTRAINT saved_items_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: saved_items saved_items_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.saved_items
    ADD CONSTRAINT saved_items_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: security_alerts security_alerts_acknowledged_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.security_alerts
    ADD CONSTRAINT security_alerts_acknowledged_by_users_id_fk FOREIGN KEY (acknowledged_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: settings settings_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: settings settings_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: settlements settlements_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.settlements
    ADD CONSTRAINT settlements_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: settlements settlements_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.settlements
    ADD CONSTRAINT settlements_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: shares shares_owner_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shares
    ADD CONSTRAINT shares_owner_id_users_id_fk FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: shares shares_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shares
    ADD CONSTRAINT shares_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: societies societies_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.societies
    ADD CONSTRAINT societies_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: societies societies_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.societies
    ADD CONSTRAINT societies_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: species species_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.species
    ADD CONSTRAINT species_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: species species_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.species
    ADD CONSTRAINT species_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: spells spells_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.spells
    ADD CONSTRAINT spells_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: spells spells_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.spells
    ADD CONSTRAINT spells_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: team_activity team_activity_team_subscription_id_user_subscriptions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.team_activity
    ADD CONSTRAINT team_activity_team_subscription_id_user_subscriptions_id_fk FOREIGN KEY (team_subscription_id) REFERENCES public.user_subscriptions(id) ON DELETE CASCADE;


--
-- Name: team_activity team_activity_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.team_activity
    ADD CONSTRAINT team_activity_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: team_invitations team_invitations_invited_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.team_invitations
    ADD CONSTRAINT team_invitations_invited_by_users_id_fk FOREIGN KEY (invited_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: team_invitations team_invitations_team_subscription_id_user_subscriptions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.team_invitations
    ADD CONSTRAINT team_invitations_team_subscription_id_user_subscriptions_id_fk FOREIGN KEY (team_subscription_id) REFERENCES public.user_subscriptions(id) ON DELETE CASCADE;


--
-- Name: team_memberships team_memberships_team_subscription_id_user_subscriptions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.team_memberships
    ADD CONSTRAINT team_memberships_team_subscription_id_user_subscriptions_id_fk FOREIGN KEY (team_subscription_id) REFERENCES public.user_subscriptions(id) ON DELETE CASCADE;


--
-- Name: team_memberships team_memberships_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.team_memberships
    ADD CONSTRAINT team_memberships_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: technologies technologies_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.technologies
    ADD CONSTRAINT technologies_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: technologies technologies_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.technologies
    ADD CONSTRAINT technologies_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: themes themes_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.themes
    ADD CONSTRAINT themes_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: themes themes_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.themes
    ADD CONSTRAINT themes_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: timeline_events timeline_events_timeline_id_timelines_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.timeline_events
    ADD CONSTRAINT timeline_events_timeline_id_timelines_id_fk FOREIGN KEY (timeline_id) REFERENCES public.timelines(id) ON DELETE CASCADE;


--
-- Name: timeline_relationships timeline_relationships_from_event_id_timeline_events_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.timeline_relationships
    ADD CONSTRAINT timeline_relationships_from_event_id_timeline_events_id_fk FOREIGN KEY (from_event_id) REFERENCES public.timeline_events(id) ON DELETE CASCADE;


--
-- Name: timeline_relationships timeline_relationships_timeline_id_timelines_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.timeline_relationships
    ADD CONSTRAINT timeline_relationships_timeline_id_timelines_id_fk FOREIGN KEY (timeline_id) REFERENCES public.timelines(id) ON DELETE CASCADE;


--
-- Name: timeline_relationships timeline_relationships_to_event_id_timeline_events_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.timeline_relationships
    ADD CONSTRAINT timeline_relationships_to_event_id_timeline_events_id_fk FOREIGN KEY (to_event_id) REFERENCES public.timeline_events(id) ON DELETE CASCADE;


--
-- Name: timelines timelines_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.timelines
    ADD CONSTRAINT timelines_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: timelines timelines_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.timelines
    ADD CONSTRAINT timelines_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: traditions traditions_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.traditions
    ADD CONSTRAINT traditions_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: traditions traditions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.traditions
    ADD CONSTRAINT traditions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: transportation transportation_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.transportation
    ADD CONSTRAINT transportation_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: transportation transportation_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.transportation
    ADD CONSTRAINT transportation_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_preferences user_preferences_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT user_preferences_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_subscriptions user_subscriptions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: weapons weapons_notebook_id_notebooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.weapons
    ADD CONSTRAINT weapons_notebook_id_notebooks_id_fk FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE CASCADE;


--
-- Name: weapons weapons_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.weapons
    ADD CONSTRAINT weapons_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

