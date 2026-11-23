import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { addDemoCampus, addTestSession, resetSessions } from '../db';
import { colors, spacing } from '../theme';

type DemoToolsScreenProps = {
  onBack: () => void;
};

export function DemoToolsScreen({ onBack }: DemoToolsScreenProps) {
  const [message, setMessage] = useState('');

  const add = async (minutes: number) => {
    try {
      await addTestSession(minutes);
      setMessage(`Added a ${minutes} min session.`);
    } catch (e) {
      console.error('addTestSession failed', e);
      setMessage('Something went wrong. Check the Metro terminal.');
    }
  };


  const addCampus = async () => {
    try {
      const created = await addDemoCampus();
      setMessage(created ? 'Added Demo Campus.' : 'A campus already exists.');
    } catch (e) {
      console.error('addDemoCampus failed', e);
      setMessage('Something went wrong. Check the Metro terminal.');
    }
  };

  const confirmReset = () => {
    Alert.alert(
      'Reset Demo Data',
      'This deletes all saved sessions. Goals and your plant choice stay.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Sessions',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetSessions();
              setMessage('All sessions deleted.');
            } catch (e) {
              console.error('resetSessions failed', e);
              setMessage('Something went wrong. Check the Metro terminal.');
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>Demo Tools</Text>

        <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Fake Progress</Text>
            <Button title="Add 30 Min Session" variant="outline" onPress={() => add(30)} />
            <Button title="Add 60 Minutes" variant="outline" onPress={() => add(60)} />
            <Button title="Add Demo Campus" variant="outline" onPress={addCampus} />
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Clean Up</Text>
          <Button title="Reset Demo Data" variant="outline" onPress={confirmReset} />
        </Card>

        {message ? <Text style={styles.message}>{message}</Text> : null}
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Back" onPress={onBack} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md },
  pageTitle: { color: colors.text, fontSize: 28, fontWeight: '700' },
  card: { gap: spacing.sm },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: '700' },
  message: { color: colors.mutedText, fontSize: 15, textAlign: 'center' },
  footer: { padding: spacing.lg },
});