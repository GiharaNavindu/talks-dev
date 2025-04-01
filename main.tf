provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "my_ec2" {
  ami           = "ami-071226ecf16aa7d96"  # Free-tier Ubuntu AMI (us-east-1)
  instance_type = "t2.micro"
  key_name      = "chat-app-key"  # Change to your key pair name

  tags = {
    Name = "Terraform-EC2"
  }
}









resource "aws_security_group" "chat_sg" {
  name = "chat-app-sg"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 4040
    to_port     = 4040
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 5173
    to_port     = 5173
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 27017
    to_port     = 27017
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_lb" "chat_alb" {
  name               = "chat-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.chat_sg.id]
  subnets            = ["subnet-093eb2291596afd78", "subnet-0f58ccc340879ddf9"] # Replace with your VPC subnets

  enable_deletion_protection = false
}

resource "aws_lb_target_group" "chat_tg" {
  name     = "chat-tg"
  port     = 5173
  protocol = "HTTP"
  vpc_id   = "vpc-086f5ba8046dda481" # Replace with your VPC ID
}

resource "aws_lb_listener" "chat_listener" {
  load_balancer_arn = aws_lb.chat_alb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.chat_tg.arn
  }
}

resource "aws_lb_target_group_attachment" "chat_tg_attachment" {
  target_group_arn = aws_lb_target_group.chat_tg.arn
  target_id        = aws_instance.chat_app.id
  port             = 5173
}

output "instance_ip" {
  value = aws_instance.chat_app.public_ip
}
