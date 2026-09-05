import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import PageTransition from "../components/PageTransition.jsx";

// Auth
import Login from "../pages/Login.jsx";
import Register from "../pages/auth/Register.jsx";

// Core Pages
import Dashboard from "../pages/Dashboard.jsx";
import Contacts from "../pages/Contacts.jsx";
import Products from "../pages/Products.jsx";
import Accounts from "../pages/Accounts.jsx";
import Journals from "../pages/Journals.jsx";

// Golden Path Document Pages
import SalesOrders from "../pages/SalesOrders.jsx";
import CreateSalesOrder from "../pages/CreateSalesOrder.jsx";
import SalesOrderDetail from "../pages/SalesOrderDetail.jsx";

import Invoices from "../pages/Invoices.jsx";
import InvoiceDetail from "../pages/InvoiceDetail.jsx";

import PurchaseOrders from "../pages/PurchaseOrders.jsx";
import CreatePurchaseOrder from "../pages/CreatePurchaseOrder.jsx";
import PurchaseOrderDetail from "../pages/PurchaseOrderDetail.jsx";

import Bills from "../pages/Bills.jsx";
import BillDetail from "../pages/BillDetail.jsx";

import Payments from "../pages/Payments.jsx";
import PaymentDetail from "../pages/PaymentDetail.jsx";

// Accounting & Management Pages
import JournalEntries from "../pages/JournalEntries.jsx";
import CreateJournalEntry from "../pages/CreateJournalEntry.jsx";
import JournalEntryDetail from "../pages/JournalEntryDetail.jsx";
import Budgets from "../pages/Budgets.jsx";
import AnalyticAccounts from "../pages/AnalyticAccounts.jsx";
import Reports from "../pages/Reports.jsx";

// Auxiliary Pages
import Profile from "../pages/Profile.jsx";
import Forbidden from "../pages/Forbidden.jsx";
import NotFound from "../pages/NotFound.jsx";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AnimatedPage = ({ Component }) => (
  <PageTransition>
    <Component />
  </PageTransition>
);

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AnimatedPage Component={Dashboard} />} />
        <Route path="contacts" element={<AnimatedPage Component={Contacts} />} />
        <Route path="products" element={<AnimatedPage Component={Products} />} />
        <Route path="accounts" element={<AnimatedPage Component={Accounts} />} />
        <Route path="journals" element={<AnimatedPage Component={Journals} />} />

        {/* Sales & Invoicing */}
        <Route path="sales-orders" element={<AnimatedPage Component={SalesOrders} />} />
        <Route path="sales-orders/new" element={<AnimatedPage Component={CreateSalesOrder} />} />
        <Route path="sales-orders/:id" element={<AnimatedPage Component={SalesOrderDetail} />} />
        <Route path="invoices" element={<AnimatedPage Component={Invoices} />} />
        <Route path="invoices/:id" element={<AnimatedPage Component={InvoiceDetail} />} />

        {/* Purchasing & Bills */}
        <Route path="purchase-orders" element={<AnimatedPage Component={PurchaseOrders} />} />
        <Route path="purchase-orders/new" element={<AnimatedPage Component={CreatePurchaseOrder} />} />
        <Route path="purchase-orders/:id" element={<AnimatedPage Component={PurchaseOrderDetail} />} />
        <Route path="bills" element={<AnimatedPage Component={Bills} />} />
        <Route path="bills/:id" element={<AnimatedPage Component={BillDetail} />} />

        {/* Payments & Audit */}
        <Route path="payments" element={<AnimatedPage Component={Payments} />} />
        <Route path="payments/:id" element={<AnimatedPage Component={PaymentDetail} />} />

        {/* Manual Journal Entries & GL */}
        <Route path="journal-entries" element={<AnimatedPage Component={JournalEntries} />} />
        <Route path="journal-entries/new" element={<AnimatedPage Component={CreateJournalEntry} />} />
        <Route path="journal-entries/:id" element={<AnimatedPage Component={JournalEntryDetail} />} />

        {/* Analytic & Budgets */}
        <Route path="budgets" element={<AnimatedPage Component={Budgets} />} />
        <Route path="analytic-accounts" element={<AnimatedPage Component={AnalyticAccounts} />} />

        {/* Reports */}
        <Route path="reports" element={<AnimatedPage Component={Reports} />} />

        {/* User & Info */}
        <Route path="profile" element={<AnimatedPage Component={Profile} />} />
        <Route path="forbidden" element={<AnimatedPage Component={Forbidden} />} />
        <Route path="*" element={<AnimatedPage Component={NotFound} />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
