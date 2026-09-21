<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Arquivo JSON de armazenamento de dados
$file = __DIR__ . '/notes.json';

if (!file_exists($file)) {
    file_put_contents($file, json_encode([]));
}

function getNotes($file) {
    $content = file_get_contents($file);
    return json_decode($content, true) ?: [];
}

function saveNotes($file, $notes) {
    file_put_contents($file, json_encode(array_values($notes), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    // READ (Listar Anotações)
    case 'GET':
        $notes = getNotes($file);
        
        // Verifica e atualiza status de tarefas atrasadas automaticamente
        $now = date('Y-m-d\TH:i');
        $updated = false;
        foreach ($notes as &$note) {
            if ($note['status'] !== 'Concluída' && !empty($note['datetime'])) {
                if ($note['datetime'] < $now) {
                    if ($note['status'] !== 'Atrasada') {
                        $note['status'] = 'Atrasada';
                        $updated = true;
                    }
                } else if ($note['status'] === 'Atrasada') {
                    $note['status'] = 'Pendente';
                    $updated = true;
                }
            }
        }
        if ($updated) {
            saveNotes($file, $notes);
        }

        echo json_encode(['success' => true, 'data' => $notes]);
        break;

    // CREATE (Criar Anotação)
    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['title']) || empty(trim($input['title']))) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'O título é obrigatório.']);
            exit();
        }

        $notes = getNotes($file);
        
        $newNote = [
            'id' => uniqid('note_', true),
            'title' => trim($input['title']),
            'description' => trim($input['description'] ?? ''),
            'category' => $input['category'] ?? 'Tarefa',
            'datetime' => $input['datetime'] ?? '',
            'status' => $input['status'] ?? 'Pendente',
            'createdAt' => date('Y-m-d H:i:s')
        ];

        // Verificar se já nasceu atrasada
        $now = date('Y-m-d\TH:i');
        if ($newNote['status'] !== 'Concluída' && !empty($newNote['datetime']) && $newNote['datetime'] < $now) {
            $newNote['status'] = 'Atrasada';
        }

        $notes[] = $newNote;
        saveNotes($file, $notes);

        echo json_encode(['success' => true, 'message' => 'Anotação criada!', 'data' => $newNote]);
        break;

    // UPDATE (Atualizar Anotação)
    case 'PUT':
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['id'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID não informado.']);
            exit();
        }

        $notes = getNotes($file);
        $foundIndex = -1;

        foreach ($notes as $index => $note) {
            if ($note['id'] === $input['id']) {
                $foundIndex = $index;
                break;
            }
        }

        if ($foundIndex === -1) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Anotação não encontrada.']);
            exit();
        }

        // Atualiza apenas os campos enviados
        $notes[$foundIndex]['title'] = trim($input['title'] ?? $notes[$foundIndex]['title']);
        $notes[$foundIndex]['description'] = trim($input['description'] ?? $notes[$foundIndex]['description']);
        $notes[$foundIndex]['category'] = $input['category'] ?? $notes[$foundIndex]['category'];
        $notes[$foundIndex]['datetime'] = $input['datetime'] ?? $notes[$foundIndex]['datetime'];
        $notes[$foundIndex]['status'] = $input['status'] ?? $notes[$foundIndex]['status'];

        // Atualização de status por prazo
        $now = date('Y-m-d\TH:i');
        if ($notes[$foundIndex]['status'] !== 'Concluída' && !empty($notes[$foundIndex]['datetime'])) {
            if ($notes[$foundIndex]['datetime'] < $now) {
                $notes[$foundIndex]['status'] = 'Atrasada';
            } else if ($notes[$foundIndex]['status'] === 'Atrasada') {
                $notes[$foundIndex]['status'] = 'Pendente';
            }
        }

        saveNotes($file, $notes);

        echo json_encode(['success' => true, 'message' => 'Anotação atualizada!', 'data' => $notes[$foundIndex]]);
        break;

    // DELETE (Excluir Anotação)
    case 'DELETE':
        $id = $_GET['id'] ?? null;
        
        if (!$id) {
            $input = json_decode(file_get_contents('php://input'), true);
            $id = $input['id'] ?? null;
        }

        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID não informado.']);
            exit();
        }

        $notes = getNotes($file);
        $filtered = array_filter($notes, function($note) use ($id) {
            return $note['id'] !== $id;
        });

        if (count($notes) === count($filtered)) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Anotação não encontrada.']);
            exit();
        }

        saveNotes($file, $filtered);

        echo json_encode(['success' => true, 'message' => 'Anotação excluída!']);
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
        break;
}