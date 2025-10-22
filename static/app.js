const BACKEND_URL = "http://localhost:8000";

async function uploadFile() {
	const fileInput = document.getElementById('fileInput');
	const output = document.getElementById('output');
	if (!fileInput.files.length) {
		output.textContent = 'Please select a file.';
		return;
	}
	const formData = new FormData();
	formData.append('file', fileInput.files[0]);
	output.textContent = 'Uploading...';
	try {
		const res = await fetch(`${BACKEND_URL}/upload`, {
			method: 'POST',
			body: formData
		});
		const data = await res.json();
		if (data.error) {
			output.textContent = 'Error: ' + data.error;
		} else {
			output.textContent = 'Extracted Text:\n' + data.text + (data.translation ? ('\n\nTranslation:\n' + data.translation) : '');
		}
	} catch (e) {
		output.textContent = 'Upload failed.';
	}
}

async function summarize() {
	const summaryDiv = document.getElementById('summary');
	summaryDiv.textContent = 'Summarizing...';
	try {
		const res = await fetch(`${BACKEND_URL}/summarize`, { method: 'POST' });
		const data = await res.json();
		summaryDiv.textContent = data.summary;
	} catch (e) {
		summaryDiv.textContent = 'Summarization failed.';
	}
}

async function askQuestion() {
	const questionInput = document.getElementById('questionInput');
	const answerDiv = document.getElementById('answer');
	const question = questionInput.value.trim();
	if (!question) {
		answerDiv.textContent = 'Please enter a question.';
		return;
	}
	answerDiv.textContent = 'Thinking...';
	const formData = new FormData();
	formData.append('question', question);
	try {
		const res = await fetch(`${BACKEND_URL}/query`, {
			method: 'POST',
			body: formData
		});
		const data = await res.json();
		answerDiv.textContent = data.answer;
	} catch (e) {
		answerDiv.textContent = 'Query failed.';
	}
}
