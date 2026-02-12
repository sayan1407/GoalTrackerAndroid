import { GoalCard } from '@/components/goal-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { getGoals } from '@/utils/storage';
import { useFocusEffect } from '@react-navigation/native';
import { isAfter, subDays, subMonths, subYears } from 'date-fns';
import React, { useCallback, useState } from 'react';
import { ScrollView, SectionList, StyleSheet, TouchableOpacity, View, useColorScheme } from 'react-native';

type Timeframe = '30days' | '12months' | '5years';

export default function HistoryScreen() {
    const [sections, setSections] = useState<{ title: string; data: any[] }[]>([]);
    const [timeframe, setTimeframe] = useState<Timeframe>('30days');
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    const fetchGoals = useCallback(async () => {
        const allGoals = await getGoals();
        const now = new Date();
        let cutoff: Date;
        let goalType: 'day' | 'month' | 'year';

        if (timeframe === '30days') {
            cutoff = subDays(now, 30);
            goalType = 'day';
        } else if (timeframe === '12months') {
            cutoff = subMonths(now, 12);
            goalType = 'month';
        } else {
            cutoff = subYears(now, 5);
            goalType = 'year';
        }

        const filtered = allGoals.filter((g: any) => {
            const goalDate = new Date(g.date);
            return g.type === goalType && isAfter(goalDate, cutoff);
        }).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

        // Group goals by date
        const grouped = filtered.reduce((acc: { [key: string]: any[] }, goal: any) => {
            const dateKey = new Date(goal.date).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: goalType === 'day' ? 'numeric' : undefined
            });
            if (!acc[dateKey]) {
                acc[dateKey] = [];
            }
            acc[dateKey].push(goal);
            return acc;
        }, {});

        // Convert to sections array
        const sectionsArray = Object.entries(grouped).map(([date, goals]): { title: string; data: any[] } => ({
            title: date,
            data: goals as any[]
        }));

        setSections(sectionsArray);
    }, [timeframe]);

    useFocusEffect(
        useCallback(() => {
            fetchGoals();
        }, [fetchGoals])
    );



    return (
        <ThemedView style={styles.container}>
            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                    {(['30days', '12months', '5years'] as Timeframe[]).map((tf) => (
                        <TouchableOpacity
                            key={tf}
                            style={[
                                styles.filterButton,
                                { backgroundColor: timeframe === tf ? theme.tint : theme.card }
                            ]}
                            onPress={() => setTimeframe(tf)}
                        >
                            <ThemedText style={[
                                styles.filterText,
                                { color: timeframe === tf ? '#FFF' : theme.text }
                            ]}>
                                {tf === '30days' ? 'Last 30 Days' : tf === '12months' ? 'Last 12 Months' : 'Last 5 Years'}
                            </ThemedText>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <SectionList
                sections={sections}
                keyExtractor={(item) => item.id}
                renderSectionHeader={({ section: { title } }) => (
                    <ThemedText style={styles.sectionHeader}>
                        {title}
                    </ThemedText>
                )}
                renderItem={({ item }) => (
                    <GoalCard
                        goal={item}
                        onStatusChange={() => { }}
                        onDelete={() => { }}
                        readonly={true}
                    />
                )}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <ThemedText style={styles.emptyText}>No goals found in this period.</ThemedText>
                    </View>
                }
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    filterContainer: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    filterScroll: {
        paddingHorizontal: 20,
        gap: 12,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    filterText: {
        fontWeight: '600',
        fontSize: 14,
    },
    list: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    sectionHeader: {
        fontSize: 14,
        fontWeight: '600',
        opacity: 0.6,
        marginTop: 16,
        marginBottom: 8,
    },
    empty: {
        marginTop: 60,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        opacity: 0.5,
    },
});
