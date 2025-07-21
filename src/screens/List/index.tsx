import { Alert, FlatList, Text } from 'react-native';
import {
  AddButton,
  AddIcon,
  AddItemForm,
  Container,
  Content,
  ItemsHeaderContainer,
  ItemsQuantity,
  ItemsTitle,
  Subtitle,
  Title,
} from './styles';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import { ShoppingItem, ShoppingList } from '../Lists';
import { Header } from '../../components/Header';
import { TextField } from '../../components/TextField';
import { ListEmpty } from '../../components/ListEmpty/indes';
import { Button } from '../../components/Button';
import { listDelete } from '../../storage/list/listDelete';
import { ListItem } from '../../components/ListItem';
import { useCallback, useState } from 'react';
import uuid from 'react-native-uuid';
import { itemCreateByList } from '../../storage/items/itemCreateByList';
import { itemGetByList } from '../../storage/items/itemGetByList';
import { AppError } from '../../utils/AppError';
import { itemDeleteByList } from '../../storage/items/itemDeleteByList';
import { itemCheckByList } from '../../storage/items/itemCheckByList';
import { itemEditByList } from '../../storage/items/itemEditByList';

type RouteParams = {
  listData: ShoppingList;
};

export function List() {
  const [itemText, setItemText] = useState('');
  const [valorItem, setValor] = useState('');
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const navigation = useNavigation();
  const route = useRoute();
  const { listData } = route.params as RouteParams;

  async function deleteList() {
    try {
      await listDelete(listData.id);
      navigation.navigate('lists');
    } catch (error) {
      console.log(error);
    }
  }

  async function handleDeleteList() {
    Alert.alert('Deletar lista', 'Você deseja remover esta lista de compras?', [
      { text: 'Não', style: 'cancel' },
      { text: 'Sim', style: 'destructive', onPress: () => deleteList() },
    ]);
  }

  async function fetchItemsByList() {
    try {
      const itemsDataFromStorage: ShoppingItem[] = await itemGetByList(
        listData.id
      );
      itemsDataFromStorage.sort((a) => (a.checked ? 1 : -1));
      setItems(itemsDataFromStorage);
    } catch (error) {
      console.log(error);
    }
  }

  async function handleCheckItem(itemIdToCheck: string, listId: string) {
    try {
      await itemCheckByList(itemIdToCheck, listId);
      fetchItemsByList();
    } catch (error) {
      if (error instanceof AppError) {
        Alert.alert('Marcar um item', error.message);
      } else {
        console.log(error);
      }
    }
  }

  async function handleDeleteItem(itemIdToDelete: string, listId: string) {
    try {
      await itemDeleteByList(itemIdToDelete, listId);
      await fetchItemsByList();
    } catch (error) {
      if (error instanceof AppError) {
        return Alert.alert('Deletar item', error.message);
      }
      console.log(error);
    }
  }

  async function handleAddNewItem() {
    try {
      if (itemText.length < 1) {
        return Alert.alert(
          'Criação de item',
          'Não é possível criar um item vazio.'
        );
      }

      let valor: number | undefined = undefined;
      if (valorItem.trim() !== '') {
        const parsed = parseFloat(valorItem);
        if (isNaN(parsed) || parsed < 0) {
          return Alert.alert('Erro', 'Informe um valor válido para o item.')
        }
        valor = parsed;
      }

      const id = uuid.v4() as string;

      const newItem: ShoppingItem = {
        itemId: id,
        text: itemText,
        checked: false,
        valorUnitario: valor,
        quantidade: 1,
      };

      setItemText('');
      setValor('');
      await itemCreateByList(newItem, listData.id);
      await fetchItemsByList();
    } catch (error) {
      if (error instanceof AppError) {
        return Alert.alert('Criação de item', error.message);
      } else {
        console.log(error);
      }
    }
  }

  async function handleIncrementItem(itemId: string) {
    const updatedItems = items.map((item) => {
      if (item.itemId === itemId) {
        const novaQuantidade = (item.quantidade || 1) + 1;
        return {
          ...item,
          quantidade: novaQuantidade,
          valorUnitario: (item.valorUnitario || 0) * novaQuantidade,
        };
      }
      return item;
    });

    setItems(updatedItems);
  }

  async function handleDecrementItem(itemId: string) {
    const updateItems = items.map((item) => {
      if (item.itemId === itemId && (item.quantidade || 1) > 1) {
        const novaQuantidade = (item.quantidade || 1) - 1;
        return {
          ...item,
          quantidade: novaQuantidade,
          valorUnitario: (item.valorUnitario || 0) / (novaQuantidade + 1) * novaQuantidade,
        };
      }
      return item;
    });

    setItems(updateItems);
  }

  async function handleEditItem(itemId: string, newText: string, newValue?: number) {
    try {
      await itemEditByList(listData.id, itemId, newText, newValue);
      await fetchItemsByList();
    } catch (error) {
      console.log(error);
    }
  }



  useFocusEffect(
    useCallback(() => {
      fetchItemsByList();
    }, [])
  );

  return (
    <Container>
      <Header
        showBackIcon
        title="Lista"
      />

      <Content>
        <Title>{listData.title}</Title>
        <Subtitle>Adicione itens a lista de compras</Subtitle>

        <AddItemForm style={{ flexDirection: 'column', gap: 8 }}>
          <TextField
            placeholder="Nome do item"
            value={itemText}
            onChangeText={setItemText}
          />

          <TextField
            placeholder="Valor do item (R$)"
            value={`R$ ${valorItem}`}
            onChangeText={(text) => {
              const clean = text.replace(/\D/g, '');
              const number = (parseInt(clean) / 100).toFixed(2);
              setValor(number.toString());
            }}
            keyboardType="numeric"
          />


          <AddButton onPress={handleAddNewItem}>
            <AddIcon />
          </AddButton>
        </AddItemForm>



        <ItemsHeaderContainer>
          <ItemsTitle>Compras</ItemsTitle>
          <ItemsQuantity>{`Items: ${items.length ? items.length : listData.items.length
            }`}</ItemsQuantity>
        </ItemsHeaderContainer>

        <FlatList
          data={items.sort()}
          keyExtractor={({ itemId }) => itemId}
          renderItem={({ item }) => (
            <ListItem
              itemData={item}
              onDelete={() => handleDeleteItem(item.itemId, listData.id)}
              onIncrement={() => handleIncrementItem(item.itemId)}
              onDecrement={() => handleDecrementItem(item.itemId)}
              onEdit={(newText, newValue) =>
                handleEditItem(item.itemId, newText, newValue)
              }
            />
          )}
          contentContainerStyle={{ gap: 12 }}
          ListEmptyComponent={() => (
            <ListEmpty message="Não Há nenhum item adicionado a lista. Adicione agora mesmo!" />
          )}
        />

        <Text style={{ fontWeight: 'bold', fontSize: 18, marginTop: 16 }}>
          Total: R$ {items.reduce((acc, item) => acc + (item.valorUnitario || 0), 0).toFixed(2)}
        </Text>


        <Button
          text="remover lista"
          variant="danger"
          onPress={handleDeleteList}
        />
      </Content>
    </Container>
  );
}
