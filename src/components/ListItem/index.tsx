import { useState } from 'react';
import { ShoppingItem } from '../../screens/Lists';
import {
  Container,
  DeleteButton,
  DeleteIcon,
} from './styles';
import { View, Text, TouchableOpacity, Alert } from 'react-native';

type ListItemProps = {
  itemData: ShoppingItem;
  onDelete: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
};

export function ListItem({
  itemData,
  onDelete,
  onIncrement,
  onDecrement,
}: ListItemProps) {

  function handleDeleteConfirmation() {
    Alert.alert(
      'Remover item',
      `Deseja realmente remover o item "${itemData.text}" da lista?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sim', style: 'destructive', onPress: onDelete },
      ]
    )
  }

  return (
    <Container>
      <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* NOME DO ITEM COM FLEX PARA CRESCER */}
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{
            flex: 1,
            fontSize: 16,
            color: 'white',
            marginRight: 12,
          }}
        >
          {itemData.text || 'Sem nome'}
        </Text>

        {/* VALOR E QUANTIDADE */}
        <Text style={{ fontSize: 14, color: '#ccc', marginRight: 40 }}>
          R$ {(itemData.valorUnitario || 0).toFixed(2)} {itemData.quantidade || 1}x
        </Text>

        <Text style={{ fontSize: 16, color: 'white', marginHorizontal: 5, flexShrink: 1 }}>
          {`${itemData.quantidade || 1} un`}
        </Text>

        {/* BOTÕES DE + / - */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
          <TouchableOpacity onPress={onDecrement} style={{ marginHorizontal: 0 }}>
            <Text style={{ fontSize: 20, color: 'white', marginHorizontal: 15 }}>−</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onIncrement}>
            <Text style={{ fontSize: 20, color: 'white' }}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* BOTÃO DE EXCLUIR */}
      <DeleteButton onPress={handleDeleteConfirmation}>
        <DeleteIcon />
      </DeleteButton>
    </Container>
  );
}
