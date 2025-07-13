-- Create a function to get user storage usage
CREATE OR REPLACE FUNCTION public.get_user_storage_info()
RETURNS TABLE(total_size BIGINT, quota_size BIGINT)
LANGUAGE plpgsql
AS $$
DECLARE
    _user_id UUID := auth.uid();
    _total_size BIGINT;
    _quota_size BIGINT := 1073741824; -- 1 GB quota (adjust as needed)
BEGIN
    SELECT SUM(size) INTO _total_size
    FROM storage.objects
    WHERE owner = _user_id;

    RETURN QUERY SELECT COALESCE(_total_size, 0), _quota_size;
END;
$$;

-- Create a trigger to create a profile for new users
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
