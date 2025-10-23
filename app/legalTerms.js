import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function LegalTermsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Legal Terms & Privacy Policy</Text>
        <Text style={styles.paragraph}>
          Welcome to our Legal Guidance App. Our goal is to provide general legal insights
          and explanations to help you understand common legal topics.
        </Text>

        <Text style={styles.subTitle}>Disclaimer</Text>
        <Text style={styles.paragraph}>
          The information provided through this app or website is for educational and
          informational purposes only. It is not a substitute for professional legal
          advice. We strongly recommend consulting a qualified lawyer or legal advisor
          before taking any legal action or making important decisions.
        </Text>

        <Text style={styles.subTitle}>No Attorney-Client Relationship</Text>
        <Text style={styles.paragraph}>
          Using this app does not create an attorney-client relationship between you and
          us. The content provided here is based on general legal principles and may not
          apply to your specific circumstances.
        </Text>

        <Text style={styles.subTitle}>Privacy Policy</Text>
        <Text style={styles.paragraph}>
          We respect your privacy. Any personal information you provide is used only to
          improve your experience within the app. We do not sell or share your data with
          third parties except when required by law.
        </Text>

        <Text style={styles.subTitle}>Recommendations</Text>
        <Text style={styles.paragraph}>
          If possible, always consult a certified lawyer or local legal expert for accurate
          guidance. Our content is designed to supplement—not replace—professional advice.
        </Text>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FB',
    paddingTop: 50,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A3C6E',
    marginBottom: 12,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A3C6E',
    marginTop: 16,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  backButton: {
    marginTop: 30,
    backgroundColor: '#1A3C6E',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
