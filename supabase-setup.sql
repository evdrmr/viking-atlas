-- Supabase Setup Script for Viking Atlas
-- Run this once in the Supabase SQL Editor as the project database owner (postgres).
-- Replace both password placeholders with different generated passwords.

create schema if not exists viking_atlas;

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'prisma_viking_atlas') then
    create role prisma_viking_atlas login
      password 'REPLACE_WITH_MIGRATION_PASSWORD'
      nosuperuser nocreatedb nocreaterole noinherit nobypassrls;
  else
    alter role prisma_viking_atlas login
      password 'REPLACE_WITH_MIGRATION_PASSWORD'
      nosuperuser nocreatedb nocreaterole noinherit nobypassrls;
  end if;

  if not exists (select 1 from pg_roles where rolname = 'viking_atlas_app') then
    create role viking_atlas_app login
      password 'REPLACE_WITH_RUNTIME_PASSWORD'
      nosuperuser nocreatedb nocreaterole noinherit nobypassrls;
  else
    alter role viking_atlas_app login
      password 'REPLACE_WITH_RUNTIME_PASSWORD'
      nosuperuser nocreatedb nocreaterole noinherit nobypassrls;
  end if;
end
$$;

grant prisma_viking_atlas to postgres;
grant create on database postgres to prisma_viking_atlas;
alter schema viking_atlas owner to prisma_viking_atlas;
revoke create on database postgres from prisma_viking_atlas;
grant connect on database postgres to prisma_viking_atlas with grant option;
grant connect on database postgres to viking_atlas_app;
grant usage, create on schema viking_atlas to prisma_viking_atlas;
grant usage on schema viking_atlas to viking_atlas_app;

alter role prisma_viking_atlas set search_path to viking_atlas, public;
alter role viking_atlas_app set search_path to viking_atlas, public;
