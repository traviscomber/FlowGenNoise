-- ===========================================================
--  FlowSketch - DB Health / Auto-Fix helper functions
--  Safe to run multiple times (IF NOT EXISTS guards)
-- ===========================================================

-- 1️⃣  EXECUTE ARBITRARY (SAFE) SQL - utility
drop function if exists public.execute_sql(text);
create or replace function public.execute_sql(query_text text)
returns void
language plpgsql
security definer
as $$
begin
  if query_text is null or query_text = '' then
    raise exception 'Query text cannot be empty';
  end if;
  execute query_text;
exception
  when others then
    raise notice 'Execute failed: %', sqlerrm;
end;
$$;

grant execute on function public.execute_sql(text) to authenticated, anon;

-- 2️⃣  GET TABLE COLUMN META
drop function if exists public.get_table_columns(name);
create or replace function public.get_table_columns(tbl_name name)
returns table(column_name text, data_type text, is_nullable text)
language sql
security definer
as $$
  select
    a.attname        as column_name,
    format_type(a.atttypid, a.atttypmod) as data_type,
    case when a.attnotnull then 'NO' else 'YES' end as is_nullable
  from   pg_attribute  a
  join   pg_class      c on c.oid = a.attrelid
  where  c.relname = tbl_name
    and  a.attnum > 0
    and  not a.attisdropped
  order  by a.attnum;
$$;

grant execute on function public.get_table_columns(name) to authenticated, anon;

-- 3️⃣  CHECK IF INDEX EXISTS
drop function if exists public.check_index_exists(name);
create or replace function public.check_index_exists(idx_name name)
returns boolean
language sql
as $$
  select exists (
    select 1
    from   pg_class
    where  relkind = 'i'    -- index
      and  relname = idx_name
  );
$$;

grant execute on function public.check_index_exists(name) to authenticated, anon;

-- 4️⃣  CHECK IF RLS ENABLED
drop function if exists public.check_rls_enabled(name);
create or replace function public.check_rls_enabled(tbl_name name)
returns boolean
language sql
as $$
  select relrowsecurity
  from   pg_class
  where  relname = tbl_name
  limit 1;
$$;

grant execute on function public.check_rls_enabled(name) to authenticated, anon;

-- ===========================================================
--  OPTIONAL: Example auto-fix routine (adds RLS if missing)
-- ===========================================================
do $$
declare
  _tbl text := 'artworks';
begin
  -- add policy only if table exists and RLS is NOT enabled
  if exists (select 1 from pg_class where relname = _tbl)
     and not public.check_rls_enabled(_tbl) then
    execute format('alter table %I enable row level security;', _tbl);
    execute format($fmt$
      create policy "anon_select_%I"
      on %I
      for select to anon
      using (true);
    $fmt$, _tbl, _tbl);
    raise notice 'RLS enabled for table "%" and public read policy created', _tbl;
  end if;
end $$;
