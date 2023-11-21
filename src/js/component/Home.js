import React, { useState, useEffect } from "react";

const Home = () => {
  const [action, setAction] = useState("");
  const [toDo, setToDo] = useState([]);
  const [deleteVisible, setDeleteVisible] = useState(-1);

  useEffect(() => {
    getToDoList();
  }, []);

  //Funciones para manejar uso de fetch
  //Funcion para crear los usuarios
  async function createUser() {
    try {
      const response = await fetch(
        "https://playground.4geeks.com/apis/fake/todos/user/uykarma",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify([]),
        }
      );

      if (response.ok) {
        getToDoList();
      } else if (response.status === 400) {
        alert("El usuario ya existe");
        throw new Error(`${response.status}`);
      }
    } catch (error) {
      if (error.message === "400") {
        getToDoList();
      }
    }
  }

  //Funcion para obtener la lista
  async function getToDoList() {
    try {
      const response = await fetch(
        "https://playground.4geeks.com/apis/fake/todos/user/uykarma",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      setToDo(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching todo list:", error);
    }
  }

  //Funcion para agregar tareas
  async function addTasks(list, newList) {
    try {
      const response = await fetch(
        "https://playground.4geeks.com/apis/fake/todos/user/uykarma",
        {
          method: "PUT",
          body: JSON.stringify((list ?? []).concat(newList)),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 404) {
        alert("El usuario no existe, se procederá a crear uno.");
        throw new Error(`${response.status}`);
      } else if (response.status === 400) {
        alert(
          "El usuario ya existe, se procederá a completar el resto de la solicitud."
        );
        throw new Error(`${response.status}`);
      } else if(response.status === 500){
        alert("El servidor no puede procesar la informacion tan rapido.")
        throw new Error(`${response.status}`)
      }else if (response.ok) {
        await getToDoList();
      }
    } catch (error) {
      if (error.message === "404") {
        await createUser();
        await addTask(list, newList);
      } else if (error.message === "400") {
        await addTask(list, newList);
      }
      else {
        console.error('Velocidad de reaccion del servidor insuficiente.')
      }
    }
  }

  //Funcion para agregar tareas como OBJETOS
  async function addTask(task, objTask) {
    setToDo((task) => (task ?? []).concat(objTask));
    console.log((task ?? []).concat(objTask));

    try {
      await fetch(
        "https://playground.4geeks.com/apis/fake/todos/user/uykarma",
        {
          method: "PUT",
          body: JSON.stringify((task ?? []).concat(objTask)),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      getToDoList();
    } catch (error) {
      console.error("Error adding task:", error);
    }
  }

  //Funcion para manejar las tareas ya sea eliminar o actualizar el estado (en este caso completar)
  async function manageTasks(updatedList) {
    try {
      const response = await fetch(
        "https://playground.4geeks.com/apis/fake/todos/user/uykarma",
        {
          method: "PUT",
          body: JSON.stringify(updatedList),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        alert("Modificado exitosamente.");
      } else if (response.status === 400) {
        alert(
          "La última tarea no se pudo eliminar, se actualizará al crear una nueva."
        );
        throw new Error(`${response.status}`);
      }
    } catch (error) {
      console.error("Error managing tasks:", error);
    }
  }

  //Funcion que borra el usuario y por consecuente tambien la lista
  async function deleteAll() {
    try {
      const response = await fetch(
        "https://playground.4geeks.com/apis/fake/todos/user/uykarma",
        {
          method: "DELETE",
          body: JSON.stringify([]),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 404) {
        alert("No existe usuario que borrar.");
        throw new Error(`${response.status}`);
      } else if (response.status === 201) {
        alert("Eliminado correctamente.");
      }
    } catch (error) {
      if (error.message === "404") {
        console.error("No existe el usuario a eliminar")
      }
    }
  }

  /* -------------------------------------------------------------------------------------------------------- */

  //Manejo de datos
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.target.value.trim() !== "") {
      const newTodo = { done: false, label: e.target.value };
      // Actualiza la lista local con la nueva
      setToDo((toDo) => (toDo ?? []).concat(newTodo));
      console.log((toDo ?? []).concat(newTodo));

      //  Llama a la funcion que controla los inputs
      addTasks(toDo, newTodo);

      // Limpia el input
      setAction("");
      e.target.value = "";
    }
  };

  const manageDelete = (index) => {
    setToDo((toDo) => {
      const updatedToDo = Array.isArray(toDo) ? [...toDo] : [];
      updatedToDo.splice(index, 1);

      //Se envia los datos a la funcion que contiene el fetch necesario para completar o eliminar tareas individuales
      manageTasks(updatedToDo);

      return updatedToDo;
    });
  };

  const manageStatus = (index) => {
    const updatedToDo = [...toDo];
    updatedToDo[index] = { ...updatedToDo[index], done: true };

    //Se envia los datos a la funcion que contiene el fetch necesario para completar o eliminar tareas individuales
    manageTasks(updatedToDo);

    setToDo(updatedToDo);
  };

  const handleDeleteAll = () => {
    // Actualiza el estado del array local a uno vacio
    setToDo([]);

    //Llama a la funcion que elimina todo
    deleteAll();
  };

  const addButton = (index) => {
    return (
      <div className="d-flex ">
        <button
          className="btn btn-outline-success ms-auto me-2"
          onClick={() => manageStatus(index)}
        >
          <i className="fa-solid fa-check"></i>
        </button>
        <button
          className="btn btn-outline-danger"
          onClick={() => manageDelete(index)}
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>
    );
  };

  return (
    <div className="container text-center">
      <div className="add-data mt-5">
        <h1 className="display-1 text-center">todos</h1>
        <div className="input-group input-group-lg">
          <input
            className="form-control fs-3"
            placeholder="Ingrese la tarea a los quehaceres"
            aria-label="Sizing example input"
            aria-describedby="inputGroup-sizing-lg"
            onKeyDown={(e) => handleKeyDown(e)}
            type="text"
            value={action}
            onChange={(e) => setAction(e.target.value)}
          />
        </div>
      </div>
      <div className="list-data">
        <ul className="list-group d-flex text-start fs-3">
          {toDo.map((todo, index) => (
            <li
              className="list-group-item"
              key={index}
              aria-current="true"
              onMouseEnter={() => setDeleteVisible(index)}
              onMouseLeave={() => setDeleteVisible(-1)}
            >
              {todo.label}
              {index === deleteVisible ? addButton(index) : ""}
            </li>
          ))}
        </ul>
        <button className="btn btn-danger mt-3" onClick={handleDeleteAll}>
          Delete All
        </button>
      </div>
    </div>
  );
};

export default Home;
