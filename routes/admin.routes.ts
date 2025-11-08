import express from "express";
// import { getAllUsersController, deleteuserByIdController } from "../AdminServices/admin.controller";
import { verifyToken, requireRole } from "../middlewares/auth.middleware";
import { getAllUsersController } from "../controllers/AdminControllers/getUsers/getusers.admin.controller";
import { deleteuserByIdController } from "../controllers/AdminControllers/deleteuser/deleteuser.controller";
import { getAllPendingRequestsController } from "../controllers/AdminControllers/pendingRequestController/getPendingRequests";
import verifySellerRequestController from "../controllers/sellerRequestverifyController/sellerVerification";
import { addSpeciesController } from '../controllers/SpeciesController/Species.Contoller';
import { getAllSpeciesController } from '../controllers/SpeciesController/getAllSpecies.contoller';
import { deleteSpeciesByIdController } from '../controllers/SpeciesController/deleteSpecies.controller';
import { addBreedController } from '../controllers/AdminControllers/breedController/addBreed';
import { getAllBreedsController } from '../controllers/AdminControllers/breedController/getAllBreeds';
import { updatePetStatusController } from '../controllers/AdminControllers/updatePetStatus/updatepet';
import { getAllnotVerifiedPetsController } from "../controllers/AdminControllers/updatePetStatus/notVerifiedPets";

export const adminRouter = express.Router();
//get all users
adminRouter.get(
    '/users',
    verifyToken,
    requireRole(['admin']),
    getAllUsersController
);
//delete user by id
adminRouter.delete(
    '/user/:userId',
    verifyToken,
    requireRole(['admin']),
    deleteuserByIdController
);
// getting all pending seller requests
adminRouter.get(
    '/seller-requests/pending',
    verifyToken,
    requireRole(['admin']),
    getAllPendingRequestsController
);


// verifying seller requests
adminRouter.put(
    '/seller-requests/:sellerRequestId/:status',
    verifyToken,
    requireRole(['admin']),
    verifySellerRequestController
);


//adding species
adminRouter.post(
    '/species',
    verifyToken,
    requireRole(['admin']),
    addSpeciesController
);

//get all species
adminRouter.get(
    '/species',
    verifyToken,
    requireRole(['admin']),
    getAllSpeciesController
);

//delete species by id
adminRouter.delete(
    '/species/:id',
    verifyToken,
    requireRole(['admin']),
    deleteSpeciesByIdController
);

//adding breed
adminRouter.post(
    '/breeds',
    verifyToken,
    requireRole(['admin']),
    addBreedController
);

//get all breeds
adminRouter.get(
    '/breeds',
    verifyToken,
    requireRole(['admin']),
    getAllBreedsController
);
//update pet verification status = true
adminRouter.patch(
    '/pets/:petId/:status',
    verifyToken,
    requireRole(['admin']),
    updatePetStatusController
);

adminRouter.get(
    '/pets/not-verified',
    verifyToken,
    requireRole(['admin']),
    getAllnotVerifiedPetsController
);