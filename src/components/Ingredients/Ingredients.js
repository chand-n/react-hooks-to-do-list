import React, { useReducer,  useCallback } from "react";
import IngredientForm from "./IngredientForm";
import IngredientList from "./IngredientList";
import ErrorModal from "../UI/ErrorModal";
import Search from "./Search";

const ingredientReducer = (state, action) => {
  switch (action.type) {
    case 'SET':
      return action.ingredients;

    case 'ADD':
      return [...state, action.ingredient];

    case 'DELETE':
      return state.filter(ingredient => action.id !== ingredient.id);

    default:
      throw new Error('Unknown action');
  }
};

const httpReducer = (currentState, action)=>{
  switch (action.type) {
    case 'SEND':
      return {loading: true, error: null};
    case 'RESPONSE':
      return {...currentState, loading: false};
    case 'ERROR':
      return {loading: false, error: action.errorMsg};
      case 'CLEAR':
        return {...currentState, error: null};
      default:
        throw new Error('Unknown action');
  }
}

const Ingredients = () => {
  const [userIngredients, dispatch] = useReducer(ingredientReducer, []);
  const [httpState, dispatchHttp] = useReducer(httpReducer,{loading: false, error:null});
   // const [userIngredients, setuserIngredients] = useState([]);
 // const [isLoading, setIsLoading] = useState(false);
 // const [error, setError]= useState();

  const filteredIngredientsHandler = useCallback((filteredIngredients) => {
   // setuserIngredients(filteredIngredients);
   dispatch({type: 'SET', ingredients: filteredIngredients});
  }, []);

  const addIngredientHandler = useCallback((ingredient) => {
    dispatchHttp({type: 'SEND'});
    fetch(
      "https://react-hooks-update-6853a-default-rtdb.firebaseio.com/ingredients.json",
      {
        method: "POST",
        body: JSON.stringify(ingredient),
        headers: { "Content-Type": "application/json" },
      }
    )
      .then((response) => {
        dispatchHttp({type: 'RESPONSE'});
        return response.json();
      })
      .then((responseData) => {
        // setuserIngredients((prevIngredients) => [
        //   ...prevIngredients,
        //   { id: responseData.name, ...ingredient },
        // ]);
        dispatch({type : 'ADD', ingredient: { id: responseData.name, ...ingredient }});
      });
  }, []);

  const removeIngredientHandler = useCallback((ingId) => {
    dispatchHttp({type: 'SEND'});
    fetch(
      `https://react-hooks-update-6853a-default-rtdb.firebaseio.com/ingredients/${ingId}.json`,
      {
        method: "DELETE",
      }
    ).then((response) => {
      dispatchHttp({type: 'RESPONSE'});
      // setuserIngredients((prevIngredients) =>
      //   prevIngredients.filter((ingredient) => ingredient.id !== ingId)
      // );
      dispatch({type: 'DELETE', id: ingId});
    }).catch(error => {
      dispatchHttp({type: 'ERROR', errorMsg: error.message});
    });
  }, []);

  const clearError = () => {
    dispatchHttp({type : 'CLEAR'})
  }
  return (
    <div className="App">
      {httpState.error && <ErrorModal onClose={clearError}>{httpState.error}</ErrorModal>}
      <IngredientForm
        onAddIngredient={addIngredientHandler}
        loading={httpState.loading}
      />
      <section>
        <Search onLoadIngredients={filteredIngredientsHandler} />
        <IngredientList
          ingredients={userIngredients}
          onRemoveItem={removeIngredientHandler}
        />
      </section>
    </div>
  );
};

export default Ingredients;
