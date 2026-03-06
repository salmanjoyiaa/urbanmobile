import React from "react";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

export type DayVisitPdfRow = {
  index: number;
  time: string;
  propertyTitle: string;
  propertyRef: string;
  visitor: string;
  counterpartLabel: string;
  counterpart: string;
};

const styles = StyleSheet.create({
  page: {
    padding: 28,
    fontSize: 10,
    color: "#0f172a",
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    paddingBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    color: "#0f2f6a",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 10,
    color: "#334155",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
    color: "#475569",
  },
  summaryCard: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 4,
    padding: 8,
    marginBottom: 10,
    backgroundColor: "#f8fafc",
  },
  summaryTitle: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 3,
  },
  table: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 4,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#e2e8f0",
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  colNo: { width: "6%" },
  colTime: { width: "12%" },
  colProperty: { width: "26%" },
  colRef: { width: "12%" },
  colVisitor: { width: "22%" },
  colCounterpart: { width: "22%" },
  th: {
    fontWeight: 700,
    fontSize: 9,
  },
  cell: {
    fontSize: 9,
    color: "#1e293b",
    paddingRight: 4,
  },
  footer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#cbd5e1",
    paddingTop: 8,
    color: "#475569",
    fontSize: 8,
  },
});

export function DayVisitSummaryPdf(props: {
  date: string;
  generatedAt: string;
  recipientType: "visiting_agent" | "property_agent";
  agentName: string;
  totalVisits: number;
  rows: DayVisitPdfRow[];
}) {
  const recipientLabel = props.recipientType === "visiting_agent" ? "Visiting Team Agent" : "Property Agent";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>TheUrbanRealEstate Daily Visits Summary</Text>
          <Text style={styles.subtitle}>Professional Daily Dispatch Sheet</Text>
          <View style={styles.metaRow}>
            <Text>Date: {props.date}</Text>
            <Text>Generated: {props.generatedAt}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text>Recipient Type: {recipientLabel}</Text>
            <Text>Agent: {props.agentName}</Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Summary</Text>
          <Text>Total Visits: {props.totalVisits}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colNo, styles.th]}>#</Text>
            <Text style={[styles.colTime, styles.th]}>Time</Text>
            <Text style={[styles.colProperty, styles.th]}>Property</Text>
            <Text style={[styles.colRef, styles.th]}>Property ID</Text>
            <Text style={[styles.colVisitor, styles.th]}>Visitor</Text>
            <Text style={[styles.colCounterpart, styles.th]}>{props.recipientType === "visiting_agent" ? "Property Agent" : "Visiting Agent"}</Text>
          </View>

          {props.rows.map((row, idx) => (
            <View key={`${row.index}-${idx}`} style={styles.row}>
              <Text style={[styles.colNo, styles.cell]}>{row.index}</Text>
              <Text style={[styles.colTime, styles.cell]}>{row.time}</Text>
              <Text style={[styles.colProperty, styles.cell]}>{row.propertyTitle}</Text>
              <Text style={[styles.colRef, styles.cell]}>{row.propertyRef}</Text>
              <Text style={[styles.colVisitor, styles.cell]}>{row.visitor}</Text>
              <Text style={[styles.colCounterpart, styles.cell]}>{row.counterpart}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          UrbanSaudi Operations Note: Please ensure all visits are coordinated and report reschedules immediately.
        </Text>
      </Page>
    </Document>
  );
}
