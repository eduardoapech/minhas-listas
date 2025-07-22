import AsyncStorage from '@react-native-async-storage/async-storage';
import { listsGetAll } from './listGetAll';
import { LIST_COLLECTION } from '../storageConfig';

export async function listRemove(listId: string): Promise<void> {
    try {
        const storedLists = await listsGetAll();
        const updatedLists = storedLists.filter((list: { id: string }) => list.id !== listId);
        const storage = JSON.stringify(updatedLists);
        await AsyncStorage.setItem(LIST_COLLECTION, storage);
    } catch (error) {
        throw error;
    }
}
