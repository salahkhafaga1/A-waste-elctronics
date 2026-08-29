import { createAdminClient } from './admin';
import type { CollectionRequest, RequestItem, CollectionRequestInsert, RequestItemInsert } from '@/types/database';

export interface FullCollectionRequest extends CollectionRequest {
  items: RequestItem[];
}

export async function createCollectionRequestInDb(
  requestData: CollectionRequestInsert,
  itemsData: Omit<RequestItemInsert, 'request_id'>[]
): Promise<FullCollectionRequest> {
  const supabase = createAdminClient();

  // 1. Insert collection request
  const { data: request, error: requestError } = await supabase
    .from('collection_requests')
    .insert({
      user_id: requestData.user_id,
      status: 'pending', // Strictly enforced on backend
      address: requestData.address,
      city: requestData.city || 'القاهرة',
      governorate: requestData.governorate || 'القاهرة',
      phone: requestData.phone,
      notes: requestData.notes || null,
      estimated_weight: requestData.estimated_weight,
      estimated_points: requestData.estimated_points,
    })
    .select()
    .single();

  if (requestError || !request) {
    console.error('Error inserting collection request:', requestError);
    throw new Error(`Failed to create collection request: ${requestError?.message || 'Unknown database error'}`);
  }

  const createdRequest = request as CollectionRequest;

  // 2. Insert associated request items
  const itemsToInsert: RequestItemInsert[] = itemsData.map((item) => ({
    request_id: createdRequest.id,
    waste_item_id: item.waste_item_id || null,
    item_name: item.item_name,
    quantity: item.quantity,
    weight: item.weight,
    condition: item.condition,
    image_url: item.image_url || null,
  }));

  const { data: insertedItems, error: itemsError } = await supabase
    .from('request_items')
    .insert(itemsToInsert)
    .select();

  if (itemsError) {
    console.error('Error inserting request items:', itemsError);
    // Return request with empty or partial items
    return {
      ...createdRequest,
      items: [],
    };
  }

  return {
    ...createdRequest,
    items: (insertedItems || []) as RequestItem[],
  };
}

export async function getCollectionRequestsByUser(userId: string): Promise<FullCollectionRequest[]> {
  const supabase = createAdminClient();

  const { data: requests, error: requestsError } = await supabase
    .from('collection_requests')
    .select('*, items:request_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (requestsError) {
    console.error('Error fetching user collection requests:', requestsError);
    return [];
  }

  return (requests || []) as FullCollectionRequest[];
}

export async function getCollectionRequestById(
  requestId: string,
  userId?: string
): Promise<FullCollectionRequest | null> {
  const supabase = createAdminClient();

  let query = supabase
    .from('collection_requests')
    .select('*, items:request_items(*)')
    .eq('id', requestId);

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query.single();

  if (error || !data) {
    return null;
  }

  return data as FullCollectionRequest;
}
