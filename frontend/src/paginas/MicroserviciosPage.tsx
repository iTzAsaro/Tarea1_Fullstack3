import { type ReactNode, useState } from 'react';
import { Button } from '../atomos/Button';
import { apiJson } from '../lib/http';
import { serviceUrls } from '../lib/serviceUrls';

type Product = {
  id: number;
  sku: string;
  nombre: string;
  precio: string;
  stock: number;
  creado_en: string;
};

type Order = {
  id: number;
  cliente: string;
  total: string;
  estado: string;
  creado_en: string;
};

type User = {
  id: number;
  email: string;
  nombre: string;
  telefono: string;
  creado_en: string;
};

type Warehouse = {
  id: number;
  codigo: string;
  nombre: string;
  ubicacion: string;
  activo: boolean;
  creado_en: string;
};

type StockLevel = {
  id: number;
  almacen: number;
  almacen_codigo: string;
  sku: string;
  cantidad: number;
  actualizado_en: string;
};

type StockMovement = {
  id: number;
  almacen: number;
  almacen_codigo: string;
  sku: string;
  delta: number;
  motivo: string;
  referencia: string;
  creado_en: string;
};

type Payment = {
  id: number;
  pedido_id: number;
  monto: string;
  moneda: string;
  proveedor: string;
  estado: string;
  idempotency_key: string;
  creado_en: string;
  actualizado_en: string;
};

type Shipment = {
  id: number;
  pedido_id: number;
  direccion: string;
  ciudad: string;
  region: string;
  pais: string;
  estado: string;
  tracking: string;
  creado_en: string;
  actualizado_en: string;
};

type Customer = {
  id: number;
  email: string;
  nombre: string;
  telefono: string;
  preferencias: Record<string, unknown>;
  etiquetas: string[];
  creado_en: string;
  actualizado_en: string;
};

type Ticket = {
  id: number;
  cliente: number | null;
  asunto: string;
  descripcion: string;
  estado: string;
  prioridad: string;
  asignado_a: string;
  creado_en: string;
  actualizado_en: string;
};

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="p-5 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {description ? <p className="text-sm text-gray-500 mt-1">{description}</p> : null}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'number' | 'email';
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </label>
  );
}

function ErrorBox({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</div>
  );
}

function JsonBox({ data }: { data: unknown }) {
  return (
    <pre className="text-xs bg-gray-50 border border-gray-200 rounded-md p-3 overflow-auto">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

export function MicroserviciosPage() {
  const bases = [
    { name: 'Inventory', base: serviceUrls.inventory },
    { name: 'Orders', base: serviceUrls.orders },
    { name: 'Users', base: serviceUrls.users },
    { name: 'Stock', base: serviceUrls.stock },
    { name: 'Payments', base: serviceUrls.payments },
    { name: 'Shipping', base: serviceUrls.shipping },
    { name: 'Customer', base: serviceUrls.customer },
  ];

  const [health, setHealth] = useState<Record<string, unknown> | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [productForm, setProductForm] = useState({ sku: '', nombre: '', precio: '14990.00', stock: '10' });
  const [productError, setProductError] = useState<string | null>(null);
  const [productLoading, setProductLoading] = useState(false);
  const [productCreated, setProductCreated] = useState<Product | null>(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [orderForm, setOrderForm] = useState({ cliente: 'Juan Pérez', total: '9900.00', estado: 'creado' });
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderCreated, setOrderCreated] = useState<Order | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [userForm, setUserForm] = useState({ email: 'cliente@shopsmart.cl', nombre: 'Cliente ShopSmart', telefono: '' });
  const [userError, setUserError] = useState<string | null>(null);
  const [userLoading, setUserLoading] = useState(false);
  const [userCreated, setUserCreated] = useState<User | null>(null);

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [levels, setLevels] = useState<StockLevel[]>([]);
  const [stockError, setStockError] = useState<string | null>(null);
  const [stockLoading, setStockLoading] = useState(false);
  const [warehouseForm, setWarehouseForm] = useState({ codigo: 'SCL-CENTRO', nombre: 'Bodega Santiago Centro', ubicacion: 'Santiago' });
  const [adjustForm, setAdjustForm] = useState({ almacen_codigo: 'SCL-CENTRO', sku: 'SKU-123', delta: '5', motivo: 'recepcion', referencia: '' });
  const [availabilitySku, setAvailabilitySku] = useState('SKU-123');
  const [availability, setAvailability] = useState<unknown>(null);

  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [startPaymentForm, setStartPaymentForm] = useState({ pedido_id: '1001', monto: '19990.00', moneda: 'CLP', idempotency_key: 'pay-1001-1' });
  const [lastPayment, setLastPayment] = useState<Payment | null>(null);
  const [confirmPaymentForm, setConfirmPaymentForm] = useState({ pago_id: '', estado: 'autorizado' });

  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [createShipmentForm, setCreateShipmentForm] = useState({ pedido_id: '1001', direccion: 'Av. Siempre Viva 742', ciudad: 'Santiago', region: 'RM', pais: 'CL' });
  const [lastShipment, setLastShipment] = useState<Shipment | null>(null);
  const [updateShipmentForm, setUpdateShipmentForm] = useState({ envio_id: '', estado: 'enviado', tracking: 'TRACK-1' });

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [customerError, setCustomerError] = useState<string | null>(null);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    email: 'cliente@shopsmart.cl',
    nombre: 'Cliente ShopSmart',
    telefono: '',
    preferencias: '{"canal":"email"}',
    etiquetas: 'vip',
  });
  const [lastCustomer, setLastCustomer] = useState<Customer | null>(null);
  const [eventForm, setEventForm] = useState({ cliente_id: '', tipo: 'vista', sku: 'SKU-123', categoria: 'tecnologia' });
  const [recommendations, setRecommendations] = useState<unknown>(null);
  const [ticketForm, setTicketForm] = useState({ cliente_id: '', asunto: 'No puedo pagar', descripcion: 'Me da error en checkout', prioridad: 'alta' });
  const [updateTicketForm, setUpdateTicketForm] = useState({ ticket_id: '', estado: 'en_progreso', asignado_a: 'agente1' });
  const [alerts, setAlerts] = useState<unknown>(null);

  const run = (fn: () => Promise<void>) => () => {
    void fn();
  };

  const checkHealth = async () => {
    setHealthError(null);
    setHealthLoading(true);
    try {
      const results: Record<string, unknown> = {};
      await Promise.all(
        bases.map(async ({ name, base }) => {
          const res = await apiJson<{ ok: boolean }>(`${base}/health/`);
          results[name] = res;
        }),
      );
      setHealth(results);
    } catch (e) {
      setHealth(null);
      setHealthError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setHealthLoading(false);
    }
  };

  const loadProducts = async () => {
    setProductError(null);
    setProductLoading(true);
    try {
      const data = await apiJson<Product[]>(`${serviceUrls.inventory}/productos/`);
      setProducts(data);
    } catch (e) {
      setProductError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setProductLoading(false);
    }
  };

  const createProduct = async () => {
    setProductError(null);
    setProductLoading(true);
    try {
      const created = await apiJson<Product>(`${serviceUrls.inventory}/productos/`, {
        method: 'POST',
        json: {
          sku: productForm.sku,
          nombre: productForm.nombre,
          precio: productForm.precio,
          stock: Number(productForm.stock),
        },
      });
      setProductCreated(created);
      setProducts((prev) => [created, ...prev]);
    } catch (e) {
      setProductError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setProductLoading(false);
    }
  };

  const loadOrders = async () => {
    setOrderError(null);
    setOrderLoading(true);
    try {
      const data = await apiJson<Order[]>(`${serviceUrls.orders}/pedidos/`);
      setOrders(data);
    } catch (e) {
      setOrderError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setOrderLoading(false);
    }
  };

  const createOrder = async () => {
    setOrderError(null);
    setOrderLoading(true);
    try {
      const created = await apiJson<Order>(`${serviceUrls.orders}/pedidos/`, {
        method: 'POST',
        json: { cliente: orderForm.cliente, total: orderForm.total, estado: orderForm.estado },
      });
      setOrderCreated(created);
      setOrders((prev) => [created, ...prev]);
      setStartPaymentForm((p) => ({ ...p, pedido_id: String(created.id), monto: created.total }));
      setCreateShipmentForm((s) => ({ ...s, pedido_id: String(created.id) }));
    } catch (e) {
      setOrderError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setOrderLoading(false);
    }
  };

  const loadUsers = async () => {
    setUserError(null);
    setUserLoading(true);
    try {
      const data = await apiJson<User[]>(`${serviceUrls.users}/usuarios/`);
      setUsers(data);
    } catch (e) {
      setUserError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setUserLoading(false);
    }
  };

  const createUser = async () => {
    setUserError(null);
    setUserLoading(true);
    try {
      const created = await apiJson<User>(`${serviceUrls.users}/usuarios/`, {
        method: 'POST',
        json: { email: userForm.email, nombre: userForm.nombre, telefono: userForm.telefono },
      });
      setUserCreated(created);
      setUsers((prev) => [created, ...prev]);
      setCustomerForm((c) => ({ ...c, email: created.email, nombre: created.nombre, telefono: created.telefono ?? '' }));
    } catch (e) {
      setUserError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setUserLoading(false);
    }
  };

  const loadWarehouses = async () => {
    setStockError(null);
    setStockLoading(true);
    try {
      const data = await apiJson<Warehouse[]>(`${serviceUrls.stock}/almacenes/`);
      setWarehouses(data);
    } catch (e) {
      setStockError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setStockLoading(false);
    }
  };

  const createWarehouse = async () => {
    setStockError(null);
    setStockLoading(true);
    try {
      const created = await apiJson<Warehouse>(`${serviceUrls.stock}/almacenes/`, {
        method: 'POST',
        json: {
          codigo: warehouseForm.codigo,
          nombre: warehouseForm.nombre,
          ubicacion: warehouseForm.ubicacion,
        },
      });
      setWarehouses((prev) => [created, ...prev]);
    } catch (e) {
      setStockError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setStockLoading(false);
    }
  };

  const loadStockLevels = async () => {
    setStockError(null);
    setStockLoading(true);
    try {
      const data = await apiJson<StockLevel[]>(`${serviceUrls.stock}/stock/niveles/`);
      setLevels(data);
    } catch (e) {
      setStockError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setStockLoading(false);
    }
  };

  const adjustStock = async () => {
    setStockError(null);
    setStockLoading(true);
    try {
      const created = await apiJson<{ nivel: StockLevel; movimiento: StockMovement }>(`${serviceUrls.stock}/stock/ajustes/`, {
        method: 'POST',
        json: {
          almacen_codigo: adjustForm.almacen_codigo,
          sku: adjustForm.sku,
          delta: Number(adjustForm.delta),
          motivo: adjustForm.motivo,
          referencia: adjustForm.referencia,
        },
      });
      setLevels((prev) => {
        const existingIndex = prev.findIndex((p) => p.id === created.nivel.id);
        if (existingIndex === -1) return [created.nivel, ...prev];
        const copy = prev.slice();
        copy[existingIndex] = created.nivel;
        return copy;
      });
      setAvailability(null);
    } catch (e) {
      setStockError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setStockLoading(false);
    }
  };

  const fetchAvailability = async () => {
    setStockError(null);
    setStockLoading(true);
    try {
      const data = await apiJson<unknown>(`${serviceUrls.stock}/stock/disponibilidad/?sku=${encodeURIComponent(availabilitySku)}`);
      setAvailability(data);
    } catch (e) {
      setStockError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setStockLoading(false);
    }
  };

  const loadPayments = async () => {
    setPaymentError(null);
    setPaymentLoading(true);
    try {
      const query = startPaymentForm.pedido_id ? `?pedido_id=${encodeURIComponent(startPaymentForm.pedido_id)}` : '';
      const data = await apiJson<Payment[]>(`${serviceUrls.payments}/pagos/${query}`);
      setPayments(data);
    } catch (e) {
      setPaymentError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setPaymentLoading(false);
    }
  };

  const startPayment = async () => {
    setPaymentError(null);
    setPaymentLoading(true);
    try {
      const created = await apiJson<Payment>(`${serviceUrls.payments}/pagos/iniciar/`, {
        method: 'POST',
        json: {
          pedido_id: Number(startPaymentForm.pedido_id),
          monto: startPaymentForm.monto,
          moneda: startPaymentForm.moneda,
          idempotency_key: startPaymentForm.idempotency_key,
        },
      });
      setLastPayment(created);
      setConfirmPaymentForm((c) => ({ ...c, pago_id: String(created.id) }));
      setPayments((prev) => {
        const exists = prev.some((p) => p.id === created.id);
        return exists ? prev.map((p) => (p.id === created.id ? created : p)) : [created, ...prev];
      });
    } catch (e) {
      setPaymentError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setPaymentLoading(false);
    }
  };

  const confirmPayment = async () => {
    setPaymentError(null);
    setPaymentLoading(true);
    try {
      const pagoIdNum = Number(confirmPaymentForm.pago_id);
      const updated = await apiJson<Payment>(`${serviceUrls.payments}/pagos/${pagoIdNum}/confirmar/`, {
        method: 'POST',
        json: { estado: confirmPaymentForm.estado },
      });
      setLastPayment(updated);
      setPayments((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } catch (e) {
      setPaymentError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setPaymentLoading(false);
    }
  };

  const loadShipments = async () => {
    setShippingError(null);
    setShippingLoading(true);
    try {
      const query = createShipmentForm.pedido_id ? `?pedido_id=${encodeURIComponent(createShipmentForm.pedido_id)}` : '';
      const data = await apiJson<Shipment[]>(`${serviceUrls.shipping}/envios/${query}`);
      setShipments(data);
    } catch (e) {
      setShippingError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setShippingLoading(false);
    }
  };

  const createShipment = async () => {
    setShippingError(null);
    setShippingLoading(true);
    try {
      const created = await apiJson<Shipment>(`${serviceUrls.shipping}/envios/crear/`, {
        method: 'POST',
        json: {
          pedido_id: Number(createShipmentForm.pedido_id),
          direccion: createShipmentForm.direccion,
          ciudad: createShipmentForm.ciudad,
          region: createShipmentForm.region,
          pais: createShipmentForm.pais,
        },
      });
      setLastShipment(created);
      setUpdateShipmentForm((u) => ({ ...u, envio_id: String(created.id) }));
      setShipments((prev) => [created, ...prev]);
    } catch (e) {
      setShippingError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setShippingLoading(false);
    }
  };

  const updateShipment = async () => {
    setShippingError(null);
    setShippingLoading(true);
    try {
      const envioIdNum = Number(updateShipmentForm.envio_id);
      const updated = await apiJson<Shipment>(`${serviceUrls.shipping}/envios/${envioIdNum}/actualizar/`, {
        method: 'POST',
        json: { estado: updateShipmentForm.estado, tracking: updateShipmentForm.tracking },
      });
      setLastShipment(updated);
      setShipments((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    } catch (e) {
      setShippingError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setShippingLoading(false);
    }
  };

  const loadCustomers = async () => {
    setCustomerError(null);
    setCustomerLoading(true);
    try {
      const data = await apiJson<Customer[]>(`${serviceUrls.customer}/clientes/`);
      setCustomers(data);
    } catch (e) {
      setCustomerError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setCustomerLoading(false);
    }
  };

  const createCustomer = async () => {
    setCustomerError(null);
    setCustomerLoading(true);
    try {
      const preferenciasParsed = customerForm.preferencias ? (JSON.parse(customerForm.preferencias) as Record<string, unknown>) : {};
      const etiquetas = customerForm.etiquetas
        ? customerForm.etiquetas
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

      const created = await apiJson<Customer>(`${serviceUrls.customer}/clientes/`, {
        method: 'POST',
        json: {
          email: customerForm.email,
          nombre: customerForm.nombre,
          telefono: customerForm.telefono,
          preferencias: preferenciasParsed,
          etiquetas,
        },
      });
      setLastCustomer(created);
      setCustomers((prev) => [created, ...prev]);
      setEventForm((ev) => ({ ...ev, cliente_id: String(created.id) }));
      setTicketForm((t) => ({ ...t, cliente_id: String(created.id) }));
    } catch (e) {
      setCustomerError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setCustomerLoading(false);
    }
  };

  const postEvent = async () => {
    setCustomerError(null);
    setCustomerLoading(true);
    try {
      const clienteIdNum = Number(eventForm.cliente_id);
      await apiJson(`${serviceUrls.customer}/clientes/${clienteIdNum}/eventos/`, {
        method: 'POST',
        json: { tipo: eventForm.tipo, sku: eventForm.sku, metadata: { categoria: eventForm.categoria } },
      });
      setRecommendations(null);
      setAlerts(null);
    } catch (e) {
      setCustomerError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setCustomerLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    setCustomerError(null);
    setCustomerLoading(true);
    try {
      const clienteIdNum = Number(eventForm.cliente_id);
      const data = await apiJson<unknown>(`${serviceUrls.customer}/recomendaciones/?cliente_id=${encodeURIComponent(String(clienteIdNum))}&limit=5`);
      setRecommendations(data);
    } catch (e) {
      setCustomerError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setCustomerLoading(false);
    }
  };

  const loadTickets = async () => {
    setCustomerError(null);
    setCustomerLoading(true);
    try {
      const query = ticketForm.cliente_id ? `?cliente_id=${encodeURIComponent(ticketForm.cliente_id)}` : '';
      const data = await apiJson<Ticket[]>(`${serviceUrls.customer}/tickets/${query}`);
      setTickets(data);
    } catch (e) {
      setCustomerError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setCustomerLoading(false);
    }
  };

  const createTicket = async () => {
    setCustomerError(null);
    setCustomerLoading(true);
    try {
      const clienteId = ticketForm.cliente_id ? Number(ticketForm.cliente_id) : undefined;
      const created = await apiJson<Ticket>(`${serviceUrls.customer}/tickets/`, {
        method: 'POST',
        json: {
          cliente_id: clienteId,
          asunto: ticketForm.asunto,
          descripcion: ticketForm.descripcion,
          prioridad: ticketForm.prioridad,
        },
      });
      setTickets((prev) => [created, ...prev]);
      setUpdateTicketForm((u) => ({ ...u, ticket_id: String(created.id) }));
    } catch (e) {
      setCustomerError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setCustomerLoading(false);
    }
  };

  const updateTicket = async () => {
    setCustomerError(null);
    setCustomerLoading(true);
    try {
      const ticketIdNum = Number(updateTicketForm.ticket_id);
      const updated = await apiJson<Ticket>(`${serviceUrls.customer}/tickets/${ticketIdNum}/actualizar/`, {
        method: 'POST',
        json: { estado: updateTicketForm.estado, asignado_a: updateTicketForm.asignado_a },
      });
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (e) {
      setCustomerError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setCustomerLoading(false);
    }
  };

  const fetchAlerts = async () => {
    setCustomerError(null);
    setCustomerLoading(true);
    try {
      const clienteIdNum = Number(eventForm.cliente_id);
      const data = await apiJson<unknown>(`${serviceUrls.customer}/clientes/${clienteIdNum}/alertas/`);
      setAlerts(data);
    } catch (e) {
      setCustomerError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setCustomerLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900">Integración de Microservicios</h1>
        <p className="text-gray-600">
          Esta pantalla permite consumir las APIs de todos los microservicios desde el frontend (vía proxy del servidor de desarrollo).
        </p>
      </header>

      <Section title="Health Check" description="Verifica rápidamente qué servicios están levantados.">
        <div className="flex flex-wrap items-center gap-2">
          <Button className="px-4 py-2" variant="secondary" disabled={healthLoading} onClick={run(checkHealth)}>
            {healthLoading ? 'Verificando…' : 'Verificar servicios'}
          </Button>
          <div className="text-sm text-gray-500">
            {bases.map((b) => (
              <span key={b.name} className="mr-3">
                {b.name}: {b.base}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-3 space-y-3">
          <ErrorBox error={healthError} />
          {health ? <JsonBox data={health} /> : null}
        </div>
      </Section>

      <Section title="Inventory Service" description="Catálogo de productos (GET/POST /productos/).">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button className="px-4 py-2" variant="secondary" disabled={productLoading} onClick={run(loadProducts)}>
                {productLoading ? 'Cargando…' : 'Cargar productos'}
              </Button>
              <Button
                className="px-4 py-2"
                variant="primary"
                disabled={productLoading || !productForm.sku || !productForm.nombre}
                onClick={run(createProduct)}
              >
                {productLoading ? 'Creando…' : 'Crear producto'}
              </Button>
            </div>
            <ErrorBox error={productError} />
            {productCreated ? <JsonBox data={productCreated} /> : null}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="SKU" value={productForm.sku} onChange={(v) => setProductForm((p) => ({ ...p, sku: v }))} placeholder="SKU-123" />
              <Field label="Nombre" value={productForm.nombre} onChange={(v) => setProductForm((p) => ({ ...p, nombre: v }))} placeholder="Polera Básica" />
              <Field label="Precio (decimal)" value={productForm.precio} onChange={(v) => setProductForm((p) => ({ ...p, precio: v }))} placeholder="14990.00" />
              <Field label="Stock" value={productForm.stock} onChange={(v) => setProductForm((p) => ({ ...p, stock: v }))} type="number" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm text-gray-700 font-medium">Resultados</div>
            <JsonBox data={products} />
          </div>
        </div>
      </Section>

      <Section title="Orders Service" description="Pedidos (GET/POST /pedidos/).">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button className="px-4 py-2" variant="secondary" disabled={orderLoading} onClick={run(loadOrders)}>
                {orderLoading ? 'Cargando…' : 'Cargar pedidos'}
              </Button>
              <Button className="px-4 py-2" variant="primary" disabled={orderLoading} onClick={run(createOrder)}>
                {orderLoading ? 'Creando…' : 'Crear pedido'}
              </Button>
            </div>
            <ErrorBox error={orderError} />
            {orderCreated ? <JsonBox data={orderCreated} /> : null}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Cliente" value={orderForm.cliente} onChange={(v) => setOrderForm((p) => ({ ...p, cliente: v }))} />
              <Field label="Total (decimal)" value={orderForm.total} onChange={(v) => setOrderForm((p) => ({ ...p, total: v }))} />
              <Field label="Estado" value={orderForm.estado} onChange={(v) => setOrderForm((p) => ({ ...p, estado: v }))} placeholder="creado" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="text-sm text-gray-700 font-medium">Resultados</div>
            <JsonBox data={orders} />
          </div>
        </div>
      </Section>

      <Section title="Users Service" description="Usuarios (GET/POST /usuarios/).">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button className="px-4 py-2" variant="secondary" disabled={userLoading} onClick={run(loadUsers)}>
                {userLoading ? 'Cargando…' : 'Cargar usuarios'}
              </Button>
              <Button
                className="px-4 py-2"
                variant="primary"
                disabled={userLoading || !userForm.email || !userForm.nombre}
                onClick={run(createUser)}
              >
                {userLoading ? 'Creando…' : 'Crear usuario'}
              </Button>
            </div>
            <ErrorBox error={userError} />
            {userCreated ? <JsonBox data={userCreated} /> : null}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Email" value={userForm.email} onChange={(v) => setUserForm((p) => ({ ...p, email: v }))} type="email" />
              <Field label="Nombre" value={userForm.nombre} onChange={(v) => setUserForm((p) => ({ ...p, nombre: v }))} />
              <Field label="Teléfono" value={userForm.telefono} onChange={(v) => setUserForm((p) => ({ ...p, telefono: v }))} placeholder="+569..." />
            </div>
          </div>
          <div className="space-y-3">
            <div className="text-sm text-gray-700 font-medium">Resultados</div>
            <JsonBox data={users} />
          </div>
        </div>
      </Section>

      <Section title="Stock Service" description="Multi-almacén (almacenes, niveles, ajustes y disponibilidad).">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button className="px-4 py-2" variant="secondary" disabled={stockLoading} onClick={run(loadWarehouses)}>
              {stockLoading ? 'Cargando…' : 'Cargar almacenes'}
            </Button>
            <Button className="px-4 py-2" variant="secondary" disabled={stockLoading} onClick={run(loadStockLevels)}>
              {stockLoading ? 'Cargando…' : 'Cargar niveles'}
            </Button>
            <Button className="px-4 py-2" variant="secondary" disabled={stockLoading || !availabilitySku} onClick={run(fetchAvailability)}>
              {stockLoading ? 'Consultando…' : 'Consultar disponibilidad'}
            </Button>
          </div>

          <ErrorBox error={stockError} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="text-sm font-semibold text-gray-900">Crear almacén</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Código" value={warehouseForm.codigo} onChange={(v) => setWarehouseForm((p) => ({ ...p, codigo: v }))} />
                <Field label="Nombre" value={warehouseForm.nombre} onChange={(v) => setWarehouseForm((p) => ({ ...p, nombre: v }))} />
                <Field label="Ubicación" value={warehouseForm.ubicacion} onChange={(v) => setWarehouseForm((p) => ({ ...p, ubicacion: v }))} />
              </div>
              <Button
                className="px-4 py-2"
                variant="primary"
                disabled={stockLoading || !warehouseForm.codigo || !warehouseForm.nombre}
                onClick={run(createWarehouse)}
              >
                {stockLoading ? 'Creando…' : 'Crear almacén'}
              </Button>
              <JsonBox data={warehouses} />
            </div>

            <div className="space-y-3">
              <div className="text-sm font-semibold text-gray-900">Ajuste de stock</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Almacén código" value={adjustForm.almacen_codigo} onChange={(v) => setAdjustForm((p) => ({ ...p, almacen_codigo: v }))} />
                <Field label="SKU" value={adjustForm.sku} onChange={(v) => setAdjustForm((p) => ({ ...p, sku: v }))} />
                <Field label="Delta" value={adjustForm.delta} onChange={(v) => setAdjustForm((p) => ({ ...p, delta: v }))} type="number" />
                <Field label="Motivo" value={adjustForm.motivo} onChange={(v) => setAdjustForm((p) => ({ ...p, motivo: v }))} />
                <Field label="Referencia" value={adjustForm.referencia} onChange={(v) => setAdjustForm((p) => ({ ...p, referencia: v }))} />
              </div>
              <Button
                className="px-4 py-2"
                variant="primary"
                disabled={stockLoading || !adjustForm.almacen_codigo || !adjustForm.sku}
                onClick={run(adjustStock)}
              >
                {stockLoading ? 'Aplicando…' : 'Aplicar ajuste'}
              </Button>
              <div className="grid grid-cols-1 gap-3">
                <div className="text-sm font-medium text-gray-700">Niveles</div>
                <JsonBox data={levels} />
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div className="text-sm font-medium text-gray-700">Disponibilidad por SKU</div>
                <Field label="SKU" value={availabilitySku} onChange={setAvailabilitySku} />
                {availability ? <JsonBox data={availability} /> : null}
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Payments Service" description="Iniciar y confirmar pagos (idempotencia básica).">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button className="px-4 py-2" variant="secondary" disabled={paymentLoading} onClick={run(loadPayments)}>
                {paymentLoading ? 'Cargando…' : 'Cargar pagos'}
              </Button>
              <Button className="px-4 py-2" variant="primary" disabled={paymentLoading} onClick={run(startPayment)}>
                {paymentLoading ? 'Creando…' : 'Iniciar pago'}
              </Button>
              <Button
                className="px-4 py-2"
                variant="primary"
                disabled={paymentLoading || !confirmPaymentForm.pago_id}
                onClick={run(confirmPayment)}
              >
                {paymentLoading ? 'Confirmando…' : 'Confirmar pago'}
              </Button>
            </div>
            <ErrorBox error={paymentError} />
            {lastPayment ? <JsonBox data={lastPayment} /> : null}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Pedido ID" value={startPaymentForm.pedido_id} onChange={(v) => setStartPaymentForm((p) => ({ ...p, pedido_id: v }))} type="number" />
              <Field label="Monto (decimal)" value={startPaymentForm.monto} onChange={(v) => setStartPaymentForm((p) => ({ ...p, monto: v }))} />
              <Field label="Moneda" value={startPaymentForm.moneda} onChange={(v) => setStartPaymentForm((p) => ({ ...p, moneda: v }))} />
              <Field
                label="Idempotency Key"
                value={startPaymentForm.idempotency_key}
                onChange={(v) => setStartPaymentForm((p) => ({ ...p, idempotency_key: v }))}
              />
              <Field label="Pago ID" value={confirmPaymentForm.pago_id} onChange={(v) => setConfirmPaymentForm((p) => ({ ...p, pago_id: v }))} type="number" />
              <Field
                label="Estado (autorizado/rechazado)"
                value={confirmPaymentForm.estado}
                onChange={(v) => setConfirmPaymentForm((p) => ({ ...p, estado: v }))}
              />
            </div>
          </div>
          <div className="space-y-3">
            <div className="text-sm text-gray-700 font-medium">Resultados</div>
            <JsonBox data={payments} />
          </div>
        </div>
      </Section>

      <Section title="Shipping Service" description="Crear envíos y actualizar estado/tracking.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button className="px-4 py-2" variant="secondary" disabled={shippingLoading} onClick={run(loadShipments)}>
                {shippingLoading ? 'Cargando…' : 'Cargar envíos'}
              </Button>
              <Button className="px-4 py-2" variant="primary" disabled={shippingLoading} onClick={run(createShipment)}>
                {shippingLoading ? 'Creando…' : 'Crear envío'}
              </Button>
              <Button
                className="px-4 py-2"
                variant="primary"
                disabled={shippingLoading || !updateShipmentForm.envio_id}
                onClick={run(updateShipment)}
              >
                {shippingLoading ? 'Actualizando…' : 'Actualizar envío'}
              </Button>
            </div>
            <ErrorBox error={shippingError} />
            {lastShipment ? <JsonBox data={lastShipment} /> : null}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Pedido ID" value={createShipmentForm.pedido_id} onChange={(v) => setCreateShipmentForm((p) => ({ ...p, pedido_id: v }))} type="number" />
              <Field label="Dirección" value={createShipmentForm.direccion} onChange={(v) => setCreateShipmentForm((p) => ({ ...p, direccion: v }))} />
              <Field label="Ciudad" value={createShipmentForm.ciudad} onChange={(v) => setCreateShipmentForm((p) => ({ ...p, ciudad: v }))} />
              <Field label="Región" value={createShipmentForm.region} onChange={(v) => setCreateShipmentForm((p) => ({ ...p, region: v }))} />
              <Field label="País" value={createShipmentForm.pais} onChange={(v) => setCreateShipmentForm((p) => ({ ...p, pais: v }))} />
              <Field label="Envío ID" value={updateShipmentForm.envio_id} onChange={(v) => setUpdateShipmentForm((p) => ({ ...p, envio_id: v }))} type="number" />
              <Field label="Estado" value={updateShipmentForm.estado} onChange={(v) => setUpdateShipmentForm((p) => ({ ...p, estado: v }))} />
              <Field label="Tracking" value={updateShipmentForm.tracking} onChange={(v) => setUpdateShipmentForm((p) => ({ ...p, tracking: v }))} />
            </div>
          </div>
          <div className="space-y-3">
            <div className="text-sm text-gray-700 font-medium">Resultados</div>
            <JsonBox data={shipments} />
          </div>
        </div>
      </Section>

      <Section title="Customer Service" description="Perfiles, eventos, recomendaciones y soporte (tickets + alertas).">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button className="px-4 py-2" variant="secondary" disabled={customerLoading} onClick={run(loadCustomers)}>
              {customerLoading ? 'Cargando…' : 'Cargar clientes'}
            </Button>
            <Button className="px-4 py-2" variant="secondary" disabled={customerLoading} onClick={run(loadTickets)}>
              {customerLoading ? 'Cargando…' : 'Cargar tickets'}
            </Button>
          </div>
          <ErrorBox error={customerError} />

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Button
                  className="px-4 py-2"
                  variant="primary"
                  disabled={customerLoading || !customerForm.email || !customerForm.nombre}
                  onClick={run(createCustomer)}
                >
                  {customerLoading ? 'Creando…' : 'Crear cliente'}
                </Button>
                <Button
                  className="px-4 py-2"
                  variant="primary"
                  disabled={customerLoading || !eventForm.cliente_id}
                  onClick={run(postEvent)}
                >
                  {customerLoading ? 'Enviando…' : 'Registrar evento'}
                </Button>
                <Button
                  className="px-4 py-2"
                  variant="secondary"
                  disabled={customerLoading || !eventForm.cliente_id}
                  onClick={run(fetchRecommendations)}
                >
                  {customerLoading ? 'Consultando…' : 'Recomendaciones'}
                </Button>
                <Button
                  className="px-4 py-2"
                  variant="secondary"
                  disabled={customerLoading || !eventForm.cliente_id}
                  onClick={run(fetchAlerts)}
                >
                  {customerLoading ? 'Consultando…' : 'Alertas'}
                </Button>
              </div>

              {lastCustomer ? <JsonBox data={lastCustomer} /> : null}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Email" value={customerForm.email} onChange={(v) => setCustomerForm((p) => ({ ...p, email: v }))} type="email" />
                <Field label="Nombre" value={customerForm.nombre} onChange={(v) => setCustomerForm((p) => ({ ...p, nombre: v }))} />
                <Field label="Teléfono" value={customerForm.telefono} onChange={(v) => setCustomerForm((p) => ({ ...p, telefono: v }))} />
                <Field label="Etiquetas (coma)" value={customerForm.etiquetas} onChange={(v) => setCustomerForm((p) => ({ ...p, etiquetas: v }))} placeholder="vip, frecuente" />
              </div>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Preferencias (JSON)</span>
                <textarea
                  value={customerForm.preferencias}
                  onChange={(e) => setCustomerForm((p) => ({ ...p, preferencias: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-20"
                />
              </label>

              <div className="text-sm font-semibold text-gray-900">Evento</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Cliente ID" value={eventForm.cliente_id} onChange={(v) => setEventForm((p) => ({ ...p, cliente_id: v }))} type="number" />
                <Field label="Tipo" value={eventForm.tipo} onChange={(v) => setEventForm((p) => ({ ...p, tipo: v }))} placeholder="vista/compra" />
                <Field label="SKU" value={eventForm.sku} onChange={(v) => setEventForm((p) => ({ ...p, sku: v }))} />
                <Field label="Categoría" value={eventForm.categoria} onChange={(v) => setEventForm((p) => ({ ...p, categoria: v }))} />
              </div>

              <div className="grid grid-cols-1 gap-3">
                {recommendations ? (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">Recomendaciones</div>
                    <JsonBox data={recommendations} />
                  </div>
                ) : null}
                {alerts ? (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">Alertas</div>
                    <JsonBox data={alerts} />
                  </div>
                ) : null}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Button
                  className="px-4 py-2"
                  variant="primary"
                  disabled={customerLoading || !ticketForm.asunto || !ticketForm.descripcion}
                  onClick={run(createTicket)}
                >
                  {customerLoading ? 'Creando…' : 'Crear ticket'}
                </Button>
                <Button
                  className="px-4 py-2"
                  variant="primary"
                  disabled={customerLoading || !updateTicketForm.ticket_id}
                  onClick={run(updateTicket)}
                >
                  {customerLoading ? 'Actualizando…' : 'Actualizar ticket'}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Cliente ID (opcional)" value={ticketForm.cliente_id} onChange={(v) => setTicketForm((p) => ({ ...p, cliente_id: v }))} type="number" />
                <Field label="Prioridad" value={ticketForm.prioridad} onChange={(v) => setTicketForm((p) => ({ ...p, prioridad: v }))} placeholder="alta/media/baja" />
                <Field label="Asunto" value={ticketForm.asunto} onChange={(v) => setTicketForm((p) => ({ ...p, asunto: v }))} />
              </div>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Descripción</span>
                <textarea
                  value={ticketForm.descripcion}
                  onChange={(e) => setTicketForm((p) => ({ ...p, descripcion: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-20"
                />
              </label>

              <div className="text-sm font-semibold text-gray-900">Actualizar ticket</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Ticket ID" value={updateTicketForm.ticket_id} onChange={(v) => setUpdateTicketForm((p) => ({ ...p, ticket_id: v }))} type="number" />
                <Field label="Estado" value={updateTicketForm.estado} onChange={(v) => setUpdateTicketForm((p) => ({ ...p, estado: v }))} />
                <Field label="Asignado a" value={updateTicketForm.asignado_a} onChange={(v) => setUpdateTicketForm((p) => ({ ...p, asignado_a: v }))} />
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="text-sm font-medium text-gray-700">Clientes</div>
                <JsonBox data={customers} />
                <div className="text-sm font-medium text-gray-700">Tickets</div>
                <JsonBox data={tickets} />
              </div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
