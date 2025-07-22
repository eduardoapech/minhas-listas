import {
  ButtonContainer,
  Container,
  Content,
  ListCount,
  Subtitle,
  Title,
} from './styles';
import { Header } from '../../components/Header';
import { ListCard } from '../../components/ListCard';
import { Button } from '../../components/Button';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, FlatList } from 'react-native';
import { listsGetAll } from '../../storage/list/listGetAll';
import { Loading } from '../../components/Loading';
import { ListEmpty } from '../../components/ListEmpty/indes';
import { listRemove } from '../../storage/list/listRemove';

export type ShoppingItem = {
  itemId: string;
  text: string;
  checked: boolean;
  valorUnitario?: number;
  quantidade?: number;
};

export interface ShoppingList {
  id: string;
  title: string;
  createdAt: string;
  items: ShoppingItem[];
}

export function Lists() {
  const [shopList, setShopList] = useState<ShoppingList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  async function fetchLists() {
    try {
      const lists = await listsGetAll();
      setShopList(lists);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleNavigateToList(list: ShoppingList) {
    navigation.navigate('list', { listData: list });
  }

  function handleDeleteList(listId: string) {
    Alert.alert(
      'Excluir lista',
      'Tem certeza que deseja excluir esta lista?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await listRemove(listId);
              fetchLists(); // recarrega as listas
            } catch (error) {
              console.log(error);
              Alert.alert('Erro', 'Não foi possível excluir a lista.');
            }
          },
        },
      ]
    );
  }

  useFocusEffect(
    useCallback(() => {
      fetchLists();
    }, [])
  );
  return (
    <Container>
      <Header title="Minhas listas" />

      <Content>
        <Title>Listas</Title>
        <Subtitle>Adicione listas de compras</Subtitle>

        <ListCount>
          {shopList.length === 1
            ? `${shopList.length} lista cadastrada`
            : `${shopList.length} listas cadastradas`}
        </ListCount>

        {isLoading ? (
          <Loading />
        ) : (
          <FlatList
            data={shopList}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ListCard
                createdAt={item.createdAt}
                itensQuantity={item.items.length}
                title={item.title}
                onPress={() => handleNavigateToList(item)}
                onLongPress={() => handleDeleteList(item.id)} // nova ação
              />

            )}
            ListEmptyComponent={() => (
              <ListEmpty message="Nenhuma lista cadastrada. Adicione agora mesmo uma lista de compras." />
            )}
            contentContainerStyle={{
              gap: 16,
              width: '100%',
              paddingBottom: 100,
            }}
          />
        )}

        <ButtonContainer>
          <Button
            text="Criar nova lista"
            onPress={() => navigation.navigate('newList')}
          />
        </ButtonContainer>
      </Content>
    </Container>
  );
}
