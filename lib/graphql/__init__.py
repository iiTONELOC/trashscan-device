MUTATIONS = {
    "ADD_ITEM": {
        "operationName": "addItemToDefaultList",
        "query": """mutation addItemToDefaultList($barcode: String!) {
    addItemToDefaultList(barcode: $barcode) {
        _id
        isCompleted
        listId
        notes
        quantity
        product {
        _id
        productAlias
        productData {
            barcode
            name
        }
        }
    }
    }"""
    }
}
