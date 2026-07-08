import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  updateDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
  type QueryConstraint,
} from 'firebase/firestore'
import { db } from '../../firebase'
import type {
  FirestoreAddRequest,
  FirestoreCollectionPageRequest,
  FirestoreCollectionPageResult,
  FirestoreDocumentRecord,
  FirestoreDocumentRequest,
  FirestorePath,
  FirestoreSetRequest,
  FirestoreWriteRequest,
} from './types'

const DEFAULT_PAGE_SIZE = 25

const collectionPageCursors = new Map<string, QueryDocumentSnapshot<DocumentData>>()

const toCollectionReference = (path: FirestorePath) => collection(db, ...path)
const toDocumentReference = (path: FirestorePath) => doc(db, ...path)

const toDocumentRecord = (
  docSnap: QueryDocumentSnapshot<DocumentData>,
): FirestoreDocumentRecord => ({
  id: docSnap.id,
  data: docSnap.data(),
})

const toCollectionQueryConstraints = ({
  orderBy: orderClauses = [],
  pageSize = DEFAULT_PAGE_SIZE,
  collectionKey,
  mode = 'first',
}: FirestoreCollectionPageRequest): QueryConstraint[] => {
  const constraints: QueryConstraint[] = [
    ...orderClauses.map((orderClause) => orderBy(orderClause.fieldPath, orderClause.direction)),
    limit(pageSize + 1),
  ]
  const cursor = collectionPageCursors.get(collectionKey)

  if (mode === 'next' && cursor) {
    return [...constraints.slice(0, -1), startAfter(cursor), constraints[constraints.length - 1]]
  }

  return constraints
}

export const firebaseServerTimestamp = () => serverTimestamp()

export const fetchFirestoreCollectionPage = async (
  request: FirestoreCollectionPageRequest,
): Promise<FirestoreCollectionPageResult> => {
  const pageSize = request.pageSize ?? DEFAULT_PAGE_SIZE
  const collectionReference = toCollectionReference(request.collectionPath)
  const collectionQuery = query(
    collectionReference,
    ...toCollectionQueryConstraints({ ...request, pageSize }),
  )
  const [snapshot, countSnapshot] = await Promise.all([
    getDocs(collectionQuery),
    request.includeTotalCount === false
      ? Promise.resolve(undefined)
      : getCountFromServer(collectionReference),
  ])
  const docs = snapshot.docs.slice(0, pageSize)
  const lastVisibleDoc = docs[docs.length - 1]

  if (lastVisibleDoc) {
    collectionPageCursors.set(request.collectionKey, lastVisibleDoc)
  } else if (request.mode !== 'next') {
    collectionPageCursors.delete(request.collectionKey)
  }

  return {
    collectionKey: request.collectionKey,
    items: docs.map(toDocumentRecord),
    totalCount: countSnapshot?.data().count,
    pageSize,
    hasNextPage: snapshot.docs.length > pageSize,
  }
}

export const fetchFirestoreDocument = async ({
  documentPath,
}: FirestoreDocumentRequest): Promise<FirestoreDocumentRecord | null> => {
  const snapshot = await getDoc(toDocumentReference(documentPath))

  return snapshot.exists() ? { id: snapshot.id, data: snapshot.data() } : null
}

export const addFirestoreDocument = ({ collectionPath, data }: FirestoreAddRequest) =>
  addDoc(toCollectionReference(collectionPath), data)

export const setFirestoreDocument = ({ documentPath, data, options }: FirestoreSetRequest) =>
  options
    ? setDoc(toDocumentReference(documentPath), data, options)
    : setDoc(toDocumentReference(documentPath), data)

export const updateFirestoreDocument = ({ documentPath, data }: FirestoreWriteRequest) =>
  updateDoc(toDocumentReference(documentPath), data)

export const deleteFirestoreDocument = ({ documentPath }: FirestoreDocumentRequest) =>
  deleteDoc(toDocumentReference(documentPath))
