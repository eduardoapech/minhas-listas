import AsyncStorage from '@react-native-async-storage/async-storage';
import { ITEM_COLLECTION } from '../storageConfig';
import { ShoppingItem } from '../../screens/Lists';

export async function itemEditByList(
  listId: string,
  itemId: string,
  newText: string,
  newValue?: number
) {
  const storageKey = `${ITEM_COLLECTION}-${listId}`;
  const data = await AsyncStorage.getItem(storageKey);

  if (!data) return;

  const items: ShoppingItem[] = JSON.parse(data);

  const updatedItems = items.map(item =>
    item.itemId === itemId
      ? { ...item, text: newText, valorUnitario: newValue }
      : item
  );

  await AsyncStorage.setItem(storageKey, JSON.stringify(updatedItems));
}

