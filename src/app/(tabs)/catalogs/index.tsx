import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const MENU = [
  { href: '/(tabs)/catalogs/teachers', label: 'Maestros', description: 'Lista de maestros que registran faltas' },
  { href: '/(tabs)/catalogs/subjects', label: 'Materias', description: 'Materias/clases disponibles' },
  { href: '/(tabs)/catalogs/students', label: 'Alumnos', description: 'Alumnos del plantel' },
  { href: '/(tabs)/catalogs/periods', label: 'Horarios', description: 'Horas o periodos de clase' },
] as const;

export default function CatalogsMenu() {
  return (
    <View style={styles.container}>
      {MENU.map((item) => (
        <Link key={item.href} href={item.href} asChild>
          <Pressable style={styles.card}>
            <Text style={styles.cardTitle}>{item.label}</Text>
            <Text style={styles.cardDescription}>{item.description}</Text>
          </Pressable>
        </Link>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
});
