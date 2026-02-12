import { Colors } from '@/constants/theme';
import { X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Modal, StyleSheet, TextInput, TouchableOpacity, View, useColorScheme } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface AddGoalModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (title: string, description: string) => void;
    type: 'day' | 'month' | 'year';
}

export const AddGoalModal = ({ visible, onClose, onSave, type }: AddGoalModalProps) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    const handleSave = () => {
        if (title.trim()) {
            onSave(title, description);
            setTitle('');
            setDescription('');
            onClose();
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <ThemedView style={[styles.content, { backgroundColor: theme.background }]}>
                    <View style={styles.header}>
                        <ThemedText type="subtitle">Add {type} Goal</ThemedText>
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} color={theme.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.form}>
                        <ThemedText style={styles.label}>Title</ThemedText>
                        <TextInput
                            style={[styles.input, { color: theme.text, borderColor: theme.tint, backgroundColor: theme.card }]}
                            placeholder="What do you want to achieve?"
                            placeholderTextColor={theme.icon}
                            value={title}
                            onChangeText={setTitle}
                        />

                        <ThemedText style={styles.label}>Description (Optional)</ThemedText>
                        <TextInput
                            style={[styles.input, styles.textArea, { color: theme.text, borderColor: theme.tint, backgroundColor: theme.card }]}
                            placeholder="Add some details..."
                            placeholderTextColor={theme.icon}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                        />

                        <TouchableOpacity
                            style={[styles.saveButton, { backgroundColor: theme.tint }]}
                            onPress={handleSave}
                        >
                            <ThemedText style={styles.saveButtonText}>Set Goal</ThemedText>
                        </TouchableOpacity>
                    </View>
                </ThemedView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    content: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        minHeight: '60%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    form: {
        gap: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    saveButton: {
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 16,
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
    },
});
