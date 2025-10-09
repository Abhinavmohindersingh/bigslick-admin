import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Hook for fetching auth users
export function useAuthUsers() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAuthUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching users from profiles table...');
      
      // Get current session to check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }
      
      // Query profiles table directly
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*');
        
      if (profileError) {
        throw new Error(`Cannot access user data: ${profileError.message}`);
      }
      
      console.log('📊 Profiles data:', profileData?.length || 0, 'users');
      setData(profileData || []);
      
    } catch (err) {
      console.error('💥 Fetch error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthUsers();
  }, []);

  return { data, loading, error, refetch: fetchAuthUsers };
}

export function useSupabaseData<T>(
  table: string,
  query?: string,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching data from table:', table);
      console.log('🔍 Query:', query || 'SELECT *');
      
      let queryBuilder = supabase.from(table);
    
      if (query) {
        queryBuilder = queryBuilder.select(query);
      } else {
        queryBuilder = queryBuilder.select('*');
      }
    
      const result = await queryBuilder;
      console.log('📊 Raw Supabase response for', table, ':', result);
      console.log('📊 Data array length:', result.data?.length || 0);
      console.log('📊 First few records:', result.data?.slice(0, 3));
      
      if (result.error) {
        console.error('❌ Supabase error:', result.error);
        console.error('❌ Error details:', result.error.message);
        console.error('❌ Error code:', result.error.code);
        throw result.error;
      }
      
      setData(result.data || []);
      console.log('✅ Successfully set', result.data?.length || 0, 'items to state for table:', table);
    } catch (err) {
      console.error('💥 Fetch error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 useEffect triggered for table:', table);
    fetchData();
  }, [table, query, ...dependencies]);

  return { data, loading, error, refetch: fetchData };
}