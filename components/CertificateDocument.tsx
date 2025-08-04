import React from "react";
import { Page, Text, View, Document, StyleSheet, Image } from "@react-pdf/renderer";

// ✅ Use full public URLs for assets
const logo = `${window.location.origin}/img/logo.png`;
const seal = `${window.location.origin}/img/seal.png`;

const styles = StyleSheet.create({
  page: {
    padding: 60,
    fontSize: 12,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
    border: "8 solid #008080",
    textAlign: "center",
    justifyContent: "flex-start",
    alignItems: "center",
    display: "flex",
    flexDirection: "column"
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 20
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#008080",
    textTransform: "uppercase"
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    color: "#333"
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 12,
    textDecoration: "underline"
  },
  description: {
    fontSize: 14,
    marginBottom: 20,
    marginHorizontal: 40,
    color: "#333"
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 500,
    marginVertical: 8,
    color: "#222"
  },
  dateLocation: {
    fontSize: 12,
    marginBottom: 10,
    color: "#444"
  },
  seal: {
    width: 90,
    height: 90,
    marginTop: 20,
    opacity: 0.3
  },
  signatureBlock: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginTop: 40
  },
  signature: {
    width: "40%",
    borderTop: "1px solid #000",
    paddingTop: 6,
    fontSize: 10,
    textAlign: "center"
  },
  footer: {
    fontSize: 10,
    color: "#666",
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: "center"
  }
});

const CertificateDocument = ({ name, eventTitle, date, location, provider }) => (
  <Document>
    {/* Portrait is default, no need to specify orientation */}
    <Page size="A4" style={styles.page}>
      <Image style={styles.logo} src={logo} />

      <Text style={styles.title}>Certificate of Participation</Text>
      <Text style={styles.subtitle}>This is to certify that</Text>

      <Text style={styles.name}>{name}</Text>

      <Text style={styles.description}>has successfully participated in the professional development activity:</Text>
      <Text style={styles.eventTitle}>{eventTitle}</Text>

      <Text style={styles.dateLocation}>
        Held on {date} {location ? `at ${location}` : ""}
      </Text>

      <Text style={styles.description}>
        Delivered by {provider || "TAE Practitioners Association Australia (TAEPAA)"} to support ongoing professional learning and capability development in line with the Standards for RTOs 2015.
      </Text>

      <Image style={styles.seal} src={seal} />

      <View style={styles.signatureBlock}>
        <Text style={styles.signature}>Authorised Association Representative</Text>
        <Text style={styles.signature}>Facilitator / Trainer</Text>
      </View>

      <Text style={styles.footer}>
        This certificate is generated electronically and does not require a physical signature.
      </Text>
    </Page>
  </Document>
);

export default CertificateDocument;
