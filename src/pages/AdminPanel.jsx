import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";

function AdminPanel() {
  const { menu, addMenuItem, updateMenuItem, deleteMenuItem, tables, addTable, deleteTable, updateTableWaiter, user } = useContext(AppContext);
  const [newItem, setNewItem] = useState({ name: "", price: "", category: "", isBestSeller: false });
  const [editItem, setEditItem] = useState(null);
  const [newTableName, setNewTableName] = useState("");
  const [editWaiter, setEditWaiter] = useState({ id: null, waiter: "" });

  if (!user) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "50px",
          background: "#fff",
          borderRadius: "10px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        }}
      >
        <h2>Iltimos, tizimga kiring!</h2>
      </div>
    );
  }

  const handleAddMenu = () => {
    if (!newItem.name || !newItem.price || !newItem.category) {
      alert("Barcha maydonlarni to‘ldiring!");
      return;
    }
    addMenuItem({
      name: newItem.name,
      price: parseInt(newItem.price),
      category: newItem.category,
      isBestSeller: newItem.isBestSeller,
    });
    setNewItem({ name: "", price: "", category: "", isBestSeller: false });
  };

  const handleEditMenu = (item) => {
    setEditItem(item);
  };

  const handleUpdateMenu = () => {
    if (!editItem.name || !editItem.price || !editItem.category) {
      alert("Barcha maydonlarni to‘ldiring!");
      return;
    }
    updateMenuItem(editItem.id, {
      name: editItem.name,
      price: parseInt(editItem.price),
      category: editItem.category,
      isBestSeller: editItem.isBestSeller,
    });
    setEditItem(null);
  };

  const handleAddTable = () => {
    if (!newTableName) {
      alert("Stol nomini kiriting!");
      return;
    }
    addTable(newTableName);
    setNewTableName("");
  };

  const handleEditWaiter = (table) => {
    setEditWaiter({ id: table.id, waiter: table.waiter });
  };

  const handleUpdateWaiter = () => {
    if (!editWaiter.waiter) {
      alert("Ofitsiant nomini kiriting!");
      return;
    }
    updateTableWaiter(editWaiter.id, editWaiter.waiter);
    setEditWaiter({ id: null, waiter: "" });
  };

  return (
    <div>
      <h1
        style={{
          textAlign: "center",
          marginBottom: "30px",
          fontSize: "28px",
        }}
      >
        Admin Panel
      </h1>

      {/* Taom qo‘shish/tahrirlash */}
      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          marginBottom: "30px",
        }}
      >
        <h2 style={{ marginBottom: "15px" }}>
          {editItem ? "Taomni tahrirlash" : "Yangi taom qo‘shish"}
        </h2>
        <input
          type="text"
          placeholder="Taom nomi"
          value={editItem ? editItem.name : newItem.name}
          onChange={(e) =>
            editItem
              ? setEditItem({ ...editItem, name: e.target.value })
              : setNewItem({ ...newItem, name: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Narxi (so‘m)"
          value={editItem ? editItem.price : newItem.price}
          onChange={(e) =>
            editItem
              ? setEditItem({ ...editItem, price: e.target.value })
              : setNewItem({ ...newItem, price: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Kategoriya"
          value={editItem ? editItem.category : newItem.category}
          onChange={(e) =>
            editItem
              ? setEditItem({ ...editItem, category: e.target.value })
              : setNewItem({ ...newItem, category: e.target.value })
          }
        />
        <label style={{ display: "block", margin: "10px 0" }}>
          <input
            type="checkbox"
            checked={editItem ? editItem.isBestSeller : newItem.isBestSeller}
            onChange={(e) =>
              editItem
                ? setEditItem({ ...editItem, isBestSeller: e.target.checked })
                : setNewItem({ ...newItem, isBestSeller: e.target.checked })
            }
          />
          Eng ko‘p sotilgan
        </label>
        <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
          <button onClick={editItem ? handleUpdateMenu : handleAddMenu}>
            {editItem ? "Yangilash" : "Qo‘shish"}
          </button>
          {editItem && (
            <button
              onClick={() => setEditItem(null)}
              style={{ background: "#6c757d" }}
            >
              Bekor qilish
            </button>
          )}
        </div>
      </div>

      {/* Taomlar ro‘yxati */}
      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          marginBottom: "30px",
        }}
      >
        <h2 style={{ marginBottom: "15px" }}>Menyu ro‘yxati</h2>
        {menu.length === 0 ? (
          <p style={{ textAlign: "center", color: "#777" }}>Menyu bo‘sh</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#007bff", color: "white" }}>
                <th style={{ padding: "12px", textAlign: "left" }}>Nomi</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Narxi</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Kategoriya</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Eng ko‘p sotilgan</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {menu.map((item) => (
                <tr key={item.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "12px" }}>{item.name}</td>
                  <td style={{ padding: "12px" }}>
                    {item.price.toLocaleString()} so‘m
                  </td>
                  <td style={{ padding: "12px" }}>{item.category}</td>
                  <td style={{ padding: "12px" }}>{item.isBestSeller ? "Ha" : "Yo‘q"}</td>
                  <td style={{ padding: "12px" }}>
                    <button
                      onClick={() => handleEditMenu(item)}
                      style={{ marginRight: "10px" }}
                    >
                      Tahrirlash
                    </button>
                    <button
                      className="delete"
                      onClick={() => deleteMenuItem(item.id)}
                    >
                      O‘chirish
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Stollar boshqaruvi */}
      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          marginBottom: "30px",
        }}
      >
        <h2 style={{ marginBottom: "15px" }}>Yangi stol qo‘shish</h2>
        <input
          type="text"
          placeholder="Stol nomi"
          value={newTableName}
          onChange={(e) => setNewTableName(e.target.value)}
        />
        <button onClick={handleAddTable} style={{ marginTop: "10px" }}>
          Qo‘shish
        </button>
      </div>

      {/* Stollar ro‘yxati */}
      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ marginBottom: "15px" }}>Stollar ro‘yxati</h2>
        {tables.length === 0 ? (
          <p style={{ textAlign: "center", color: "#777" }}>Stollar yo‘q</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#007bff", color: "white" }}>
                <th style={{ padding: "12px", textAlign: "left" }}>Nomi</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Ofitsiant</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {tables.map((table) => (
                <tr key={table.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "12px" }}>{table.name}</td>
                  <td style={{ padding: "12px" }}>
                    {editWaiter.id === table.id ? (
                      <div style={{ display: "flex", gap: "10px" }}>
                        <input
                          type="text"
                          value={editWaiter.waiter}
                          onChange={(e) =>
                            setEditWaiter({ ...editWaiter, waiter: e.target.value })
                          }
                          placeholder="Ofitsiant ismi"
                        />
                        <button onClick={handleUpdateWaiter}>Saqlash</button>
                        <button
                          onClick={() => setEditWaiter({ id: null, waiter: "" })}
                          style={{ background: "#6c757d" }}
                        >
                          Bekor
                        </button>
                      </div>
                    ) : (
                      table.waiter || "Belgilanmagan"
                    )}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <button
                      onClick={() => handleEditWaiter(table)}
                      style={{ marginRight: "10px" }}
                    >
                      Ofitsiantni tahrirlash
                    </button>
                    <button
                      className="delete"
                      onClick={() => deleteTable(table.id)}
                    >
                      O‘chirish
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;