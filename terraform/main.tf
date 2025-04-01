provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "chat_app" {
  ami           = "ami-0b2f6494ff0b07a0e" # Windows Server 2022 Free Tier
  instance_type = "t2.micro"
  key_name      = "chat-app-key"
  security_groups = [aws_security_group.chat_sg.name]

  tags = {
    Name = "ChatAppServer"
  }
}

resource "aws_security_group" "chat_sg" {
  name        = "chat_app_sg"
  description = "Allow required ports"

  ingress {
    from_port   = 3389
    to_port     = 3389
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # RDP Access
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # HTTP
  }

  ingress {
    from_port   = 4040
    to_port     = 4040
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Backend service
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # SSH
  }

  ingress {
    from_port   = 5173
    to_port     = 5173
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Frontend
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

output "instance_public_ip" {
  value = aws_instance.chat_app.public_ip
}
