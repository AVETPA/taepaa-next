import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 14,
    fontFamily: "Helvetica"
  },
  heading: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 20
  },
  section: {
    marginBottom: 10
  }
});

const Certificate = ({ name, eventTitle, date }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.heading}>Certificate of Completion</Text>

      <View style={styles.section}>
        <Text>This certifies that</Text>
        <Text style={{ fontSize: 18, marginVertical: 5 }}>{name}</Text>
        <Text>has successfully participated in the following event:</Text>
      </View>

      <View style={styles.section}>
        <Text>📌 Event: {eventTitle}</Text>
        <Text>📅 Date: {date}</Text>
      </View>

      <Text style={{ marginTop: 50, fontSize: 12, textAlign: "center" }}>
        Australian VET Practitioners Association
      </Text>
    </Page>
  </Document>
);

export default Certificate;
