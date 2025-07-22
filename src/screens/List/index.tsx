import { Alert, FlatList, Text } from "react-native";
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
} from "./styles";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import { ShoppingItem, ShoppingList } from "../Lists";
import { Header } from "../../components/Header";
import { TextField } from "../../components/TextField";
import { ListEmpty } from "../../components/ListEmpty/indes";
import { ListItem } from "../../components/ListItem";
import { useCallback, useState } from "react";
import uuid from "react-native-uuid";
import { itemCreateByList } from "../../storage/items/itemCreateByList";
import { itemGetByList } from "../../storage/items/itemGetByList";
import { AppError } from "../../utils/AppError";
import { itemDeleteByList } from "../../storage/items/itemDeleteByList";
import { itemEditByList } from "../../storage/items/itemEditByList";

type RouteParams = {
  listData: ShoppingList;
};

export function List() {
  const [itemText, setItemText] = useState("");
  const [valorItem, setValor] = useState("");
  const [items, setItems] = useState<ShoppingItem[]>([]);

  const navigation = useNavigation();
  const route = useRoute();
  const { listData } = route.params as RouteParams;

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

  async function handleDeleteItem(itemIdToDelete: string, listId: string) {
    try {
      await itemDeleteByList(itemIdToDelete, listId);
      await fetchItemsByList();
    } catch (error) {
      if (error instanceof AppError) {
        return Alert.alert("Deletar item", error.message);
      }
      console.log(error);
    }
  }

  async function handleAddNewItem() {
    try {
      if (itemText.trim().length < 1) {
        return Alert.alert(
          "Criação de item",
          "Não é possível criar um item vazio."
        );
      }

      let valor: number | undefined = undefined;
      if (valorItem.trim() !== "") {
        const parsed = parseFloat(valorItem.replace(",", "."));
        if (!isNaN(parsed) && parsed >= 0) {
          valor = parsed;
        } else {
          return Alert.alert("Erro", "Informe um valor válido para o item.");
        }
      }

      const id = uuid.v4() as string;

      const newItem: ShoppingItem = {
        itemId: id,
        text: itemText,
        checked: false,
        valorUnitario: valor,
        quantidade: 1,
      };

      setItemText("");
      setValor("");

      await itemCreateByList(newItem, listData.id);
      await fetchItemsByList();
    } catch (error) {
      if (error instanceof AppError) {
        return Alert.alert("Criação de item", error.message);
      } else {
        console.log(error);
      }
    }
  }

  async function handleIncrementItem(itemId: string) {
    const itemAtual = items.find((item) => item.itemId === itemId);
    if (!itemAtual) return;

    const novaQuantidade = (itemAtual.quantidade || 1) + 1;

    await itemEditByList(
      listData.id,
      itemId,
      itemAtual.text,
      itemAtual.valorUnitario,
      novaQuantidade
    );

    await fetchItemsByList();
  }

  async function handleDecrementItem(itemId: string) {
    const itemAtual = items.find((item) => item.itemId === itemId);
    if (!itemAtual || (itemAtual.quantidade || 1) <= 1) return;

    const novaQuantidade = (itemAtual.quantidade || 1) - 1;

    await itemEditByList(
      listData.id,
      itemId,
      itemAtual.text,
      itemAtual.valorUnitario,
      novaQuantidade
    );

    await fetchItemsByList();
  }

  async function handleEditItem(
    itemId: string,
    newText: string,
    newValue?: number
  ) {
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
      <Header showBackIcon title="Lista" />

      <Content>
        <Title>{listData.title}</Title>
        <Subtitle>Adicione itens à lista de compras</Subtitle>

        <AddItemForm
          style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
        >
          <TextField
            placeholder="Nome do item"
            value={itemText}
            onChangeText={setItemText}
            style={{ flex: 2 }} // ocupa mais espaço
          />

          <TextField
            placeholder="R$"
            value={valorItem}
            onChangeText={(text) => {
              const clean = text.replace(/\D/g, "");
              const number = (parseInt(clean) || 0) / 100;
              const formatted = number.toFixed(2);
              setValor(formatted);
            }}
            keyboardType="numeric"
            style={{ flex: 1 }} // ocupa menos espaço
          />

          <AddButton onPress={handleAddNewItem}>
            <AddIcon />
          </AddButton>
        </AddItemForm>

        <ItemsHeaderContainer>
          <ItemsTitle>Compras</ItemsTitle>
          <ItemsQuantity>{`Items: ${items.length}`}</ItemsQuantity>
        </ItemsHeaderContainer>

        <FlatList
          data={items}
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
          contentContainerStyle={{ gap: 12, paddingBottom: 40 }}
          ListFooterComponent={() => (
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 22,
                marginTop: 16,
                color: "#ccc",
                textAlign: "right",
                marginRight: 8,
              }}
            >
              Total: R${" "}
              {items
                .reduce((acc, item) => {
                  const preco = item.valorUnitario || 0;
                  const qtd = item.quantidade || 1;
                  return acc + preco * qtd;
                }, 0)
                .toFixed(2)}
            </Text>
          )}
          ListEmptyComponent={() => (
            <ListEmpty message="Não há nenhum item adicionado à lista. Adicione agora mesmo!" />
          )}
        />
      </Content>
    </Container>
  );
}
