import { useState } from "react";
import { ShoppingItem } from "../../screens/Lists";
import { Container, DeleteButton, DeleteIcon } from "./styles";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Button as RNButton,
} from "react-native";

type ListItemProps = {
  itemData: ShoppingItem;
  onDelete: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onEdit?: (newText: string, newValue?: number) => void;
};

export function ListItem({
  itemData,
  onDelete,
  onIncrement,
  onDecrement,
  onEdit,
}: ListItemProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [editedText, setEditedText] = useState(itemData.text);
  const [editedValue, setEditedValue] = useState(
    itemData.valorUnitario?.toFixed(2) || ""
  );

  function handleDeleteConfirmation() {
    Alert.alert(
      "Remover item",
      `Deseja realmente remover o item "${itemData.text}" da lista?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Sim", style: "destructive", onPress: onDelete },
      ]
    );
  }

  function handleSaveEdit() {
    if (editedText.trim() === "") {
      Alert.alert("Erro", "O nome do item não pode estar vazio.");
      return;
    }

    let value: number | undefined = undefined;
    if (editedValue.trim() !== "") {
      const parsed = parseFloat(editedValue.replace(",", "."));
      if (isNaN(parsed) || parsed < 0) {
        Alert.alert("Erro", "Informe um valor válido (ou deixe em branco).");
        return;
      }
      value = parsed;
    }

    onEdit?.(editedText.trim(), value);
    setModalVisible(false);
  }

  return (
    <>
      <TouchableOpacity onLongPress={() => setModalVisible(true)}>
        <Container>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 10,
            }}
          >
            {/* PRODUTO */}
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                flex: 1,
                fontSize: 16,
                color: "white",
              }}
            >
              {itemData.text || "Sem nome"}
            </Text>

            {/* PREÇO */}
            <Text
              style={{
                width: 80,
                fontSize: 14,
                color: "#ccc",
                textAlign: "center",
              }}
            >
              R$ {(itemData.valorUnitario || 0).toFixed(2)}
            </Text>

            {/* UNIDADES */}
            <Text
              style={{
                width: 70,
                fontSize: 16,
                color: "white",
                textAlign: "center",
              }}
            >
              {`${itemData.quantidade || 1} un`}
            </Text>

            {/* BOTÕES + / - */}
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <TouchableOpacity
                onPress={onDecrement}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  backgroundColor: "#e74c3c",
                  borderRadius: 6,
                }}
              >
                <Text style={{ fontSize: 18, color: "white" }}>−</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onIncrement}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  backgroundColor: "#2ecc71",
                  borderRadius: 6,
                }}
              >
                <Text style={{ fontSize: 18, color: "white" }}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* BOTÃO DE EXCLUIR */}
          <DeleteButton onPress={handleDeleteConfirmation}>
            <DeleteIcon />
          </DeleteButton>
        </Container>
      </TouchableOpacity>

      {/* MODAL DE EDIÇÃO */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            backgroundColor: "#000000aa",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              margin: 20,
              padding: 20,
              borderRadius: 8,
            }}
          >
            <Text style={{ fontSize: 18, marginBottom: 10 }}>Editar item</Text>

            <TextInput
              placeholder="Nome"
              value={editedText}
              onChangeText={setEditedText}
              style={{ borderBottomWidth: 1, marginBottom: 12 }}
            />

            <TextInput
              placeholder="Valor (R$)"
              keyboardType="decimal-pad"
              value={editedValue}
              onChangeText={setEditedValue}
              style={{ borderBottomWidth: 1, marginBottom: 20 }}
            />

            <RNButton title="Salvar" onPress={handleSaveEdit} />
            <RNButton
              title="Cancelar"
              color="red"
              onPress={() => setModalVisible(false)}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}
