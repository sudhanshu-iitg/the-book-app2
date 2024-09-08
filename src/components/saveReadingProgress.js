import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_supabaseUrl;
const supabaseKey = process.env.REACT_APP_supabaseKey;
const supabase = createClient(supabaseUrl, supabaseKey);

const saveReadingProgress = async (userId, bookId, chapterId, cardId,total_cards,card_number) => {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .upsert(
        { 
          user_id: userId, 
          book_id: bookId, 
          chapter_id: chapterId, 
          card_id: cardId,
          last_read_at: new Date().toISOString(),
          card_number:card_number,
          total_cards:total_cards
        },
        { onConflict: 'user_id, chapter_id' }
      );

    if (error) throw error;
    console.log('Progress saved successfully');
  } catch (error) {
    console.error('Error saving progress:', error);
  }
};

export default saveReadingProgress;