import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';

const SECTIONS = [
  {
    key: 'about',
    title: 'About Us',
    icon: 'information-circle-outline',
    content: [
      { heading: null, body: 'FullTime by Instant Live Football brings you free live football streams, match schedules, scores, standings, and news — all in one app.' },
      { heading: null, body: 'Have a question, feedback, or want to advertise with us? Reach out anytime.' },
      { heading: 'Contact', body: 'support@instantlivefootball.com.ng\nWhatsApp: +234 704 093 9397' },
    ],
  },
  {
    key: 'terms',
    title: 'Terms of Use',
    icon: 'document-text-outline',
    lastUpdated: 'July 2026',
    content: [
      { heading: '1. Acceptance', body: 'By using FullTime, you agree to these terms. If you disagree, please stop using the service.' },
      { heading: '2. Service Description', body: 'FullTime provides links to live football streams. We do not host any video content directly.' },
      { heading: '3. User Conduct', body: 'You agree not to misuse the service, attempt to hack, scrape, or disrupt the platform in any way.' },
      { heading: '4. Intellectual Property', body: 'All content, logos and branding on FullTime belong to their respective owners.' },
      { heading: '5. Disclaimer', body: 'FullTime is provided "as is" without warranties. We are not responsible for third-party stream content.' },
      { heading: '6. Changes', body: 'We may update these terms at any time. Continued use means acceptance of updated terms.' },
      { heading: '7. Contact', body: 'Questions? Email us at: support@instantlivefootball.com.ng' },
    ],
  },
  {
    key: 'privacy',
    title: 'Privacy Policy',
    icon: 'shield-checkmark-outline',
    lastUpdated: 'June 2026',
    content: [
      { heading: '1. Information We Collect', body: 'We collect minimal information to provide our live football streaming service. This includes usage data and preferences stored locally on your device.' },
      { heading: '2. How We Use Information', body: 'We use collected information to improve our service, show relevant matches, and send notifications if you opt in.' },
      { heading: '3. Cookies', body: 'We use cookies to remember your preferences such as theme and notification settings. You can disable cookies in your browser settings.' },
      { heading: '4. Third-Party Services', body: 'We use Firebase for data storage, and third-party APIs for match data and standings. These services have their own privacy policies.' },
      { heading: '5. Data Security', body: 'We take reasonable measures to protect your data. However, no internet transmission is 100% secure.' },
      { heading: '6. Contact Us', body: 'If you have questions about this privacy policy, contact us at: support@instantlivefootball.com.ng' },
    ],
  },
];

export default function SettingsScreen() {
  const { COLORS } = useTheme();
  const styles = getStyles(COLORS);
  const [expanded, setExpanded] = React.useState(null);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      {SECTIONS.map((section) => {
        const isOpen = expanded === section.key;
        return (
          <View key={section.key} style={styles.card}>
            <TouchableOpacity
              style={styles.cardHeader}
              onPress={() => setExpanded(isOpen ? null : section.key)}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeaderLeft}>
                <Ionicons name={section.icon} size={20} color={COLORS.gold} />
                <Text style={styles.cardTitle}>{section.title}</Text>
              </View>
              <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
            {isOpen && (
              <View style={styles.cardBody}>
                {section.lastUpdated && (
                  <Text style={styles.lastUpdated}>Last updated: {section.lastUpdated}</Text>
                )}
                {section.content.map((block, i) => (
                  <View key={i} style={styles.block}>
                    {block.heading && <Text style={styles.blockHeading}>{block.heading}</Text>}
                    <Text style={styles.blockBody}>{block.body}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      })}

      <TouchableOpacity
        style={styles.emailBtn}
        onPress={() => Linking.openURL('mailto:support@instantlivefootball.com.ng')}
      >
        <Ionicons name="mail-outline" size={16} color={COLORS.gold} />
        <Text style={styles.emailText}>support@instantlivefootball.com.ng</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function getStyles(COLORS) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    card: { backgroundColor: COLORS.bgCard, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
    cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    cardTitle: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700' },
    cardBody: { paddingHorizontal: 16, paddingBottom: 16 },
    lastUpdated: { color: COLORS.textMuted, fontSize: 12, marginBottom: 12, fontStyle: 'italic' },
    block: { marginBottom: 12 },
    blockHeading: { color: COLORS.gold, fontSize: 13, fontWeight: '700', marginBottom: 4 },
    blockBody: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 20 },
    emailBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, marginTop: 4 },
    emailText: { color: COLORS.gold, fontSize: 13, fontWeight: '600' },
  });
}
